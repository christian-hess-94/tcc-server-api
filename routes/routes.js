module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    

    application.post("/get_users", function (req, res) {
        var data = req.body;
        console.log(data.user + " wants to get all users");

        var query = {}
        User.find(function (errUser, users) {
            if (errUser) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                console.log("Users found: " + users.length);
                res.send(users);
            }
        });
    });

    application.post("/send_sync", function (req, res) {
        // recieves message, both ids of the sender and receiver, add the status as not_read, and an option to redirect to the send_async        
        // to send a message to the same receiver_api_id so that it can call the receive_sync route
        var data = req.body;
        console.log("Sending synchronous message from " + data.sender_api_id + " to " + data.receiver_api_id);

        var new_message =
            {
                sender_api_id: parseInt(data.sender_api_id),
                group_id: 0,
                msg: data.msg,
                title: "",
                body: "",
                receiver_api_id: parseInt(data.receiver_api_id),
                status: "not_read",
                type: "sync"
            }
        var message = new Message(new_message);
        message.save()
            .then(function (result) {
                console.log("Message \'" + new_message.msg + "\' was saved from " + new_message.sender_api_id + " to " + new_message.receiver_api_id);
                res.send("success");
            })
            .catch(function (mongo_error) {
                console.log("Error while trying to save new sync_message to database: " + mongo_error);
                res.send("mongo_error");
            });
    });


    application.post("/receive_sync", function (req, res) {
        var data = req.body;

        var query =
            {
                receiver_api_id: data.sender_api_id,
                type: "sync",
                status: "not_read"
            }
        Message.find(query, function (error, messages) {
            if (error) {
                console.log("There was an error trying to get the Messages from the database: " + error)
                res.send("mongo_error");
            } else {
                if (messages.length === 0) {
                    console.log("No sync messages found for user with api_id " + data.sender_api_id);
                    res.send("no_messages");
                } else {
                    console.log(messages.length + " sync messages found for user with api_id " + data.sender_api_id);
                    for (var i = 0; i < messages.length; i++) {
                        var updatemessage = messages[i];
                        updatemessage["status"] = "read";
                        console.log(updatemessage);
                    }

                    res.send(messages);

                }
            }

        });
    });

    application.post("/send_async", function (req, res) {
        var data = req.body;

        console.log("Sending Asynchronous message from " + data.api_id + " to " + data.receiver_api_id);

        User.findOne({ api_id: data.receiver_api_id }, function (error, user) {
            if (error) {
                console.log("There was an error trying to get the User from the database: " + error)
                res.send("mongo_error");
            } else {
                if (user === null) {
                    console.log("There is no user with this api_id stored in the database.");
                    res.send("user_does_not_exist");
                } else {
                    var RequestBody = {};
                    if (data.type === "notification") {
                        console.log("Sending notification to user with api_id " + user.api_id)
                        RequestBody =
                            {
                                "notification": {
                                    "title": data.title,
                                    "body": data.body
                                },
                                "to": user.firebase
                            }
                    } else {
                        console.log("Sending data message to user with api_id " + user.api_id)
                        RequestBody =
                            {
                                "data":
                                {
                                    "message": data.msg
                                },
                                "to": user.firebase
                            }
                    }
                    request({
                        url: 'https://fcm.googleapis.com/fcm/send',
                        method: "POST",
                        headers: {
                            "Authorization": "key=AAAA_wmzIFo:APA91bGrOk1WveK9t6jdRuvxlFNOEBu4VYid90_HFL5tKE43uquk0tuhvfy8AzMiBp4mQLrB4wKWsuYkRzu5bQ_LeJlcJ4P54cPqULniE_VmiI_M-LCZiX6lcHlHX8gSU4hlqDLU16cn", //Ja ta com a server key do brecar. Qualquer coisa: https://console.firebase.google.com -> login com conta de gmail do brecar
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(RequestBody)
                    }, function (error, response, body) {
                        if (error) {
                            console.error(error);
                            res.send("firebase_error")
                        }
                        else if (response.statusCode >= 400) {
                            console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage + '\n' + body);
                            res.send("firebase_error")
                        }
                        else {
                            console.log('Done!')
                        }
                        if (data.save === 1) {
                            var new_message
                            if (data.notification) {
                                new_message =
                                    {
                                        sender_api_id: parseInt(data.api_id),
                                        group_id: 0,
                                        msg: data.title + " - " + data.body,
                                        title: data.title,
                                        body: data.body,
                                        receiver_api_id: parseInt(user.api_id),
                                        status: "not_read",
                                        type: "async"
                                    }
                            } else {
                                new_message =
                                    {
                                        sender_api_id: parseInt(data.api_id),
                                        msg: data.msg,
                                        title: data.title,
                                        body: data.body,
                                        receiver_api_id: parseInt(user.api_id),
                                        status: "not_read",
                                        type: "async"
                                    }
                            }

                            var message = new Message(new_message);
                            message.save()
                                .then(function (result) {
                                    console.log("Message \'" + new_message.msg + "\' was saved from " + new_message.sender_api_id + " to " + new_message.receiver_api_id);
                                    res.send("success");
                                })
                                .catch(function (mongo_error) {
                                    console.log("Error while trying to save new async_message to database: " + mongo_error);
                                    res.send("mongo_error");
                                });
                        }
                    });
                }
            }
        });



    });

    application.post("/create_group", function (req, res) {
        var data = req.body;

        console.log("Sending Asynchronous message from " + data.api_id + " to " + data.receiver_api_id);
        var create = {};
        Group.find(function (mongo_error, groups) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                var max;
                for (var i = 0; i < groups.length; i++) {
                    if (!max || parseInt(groups[i]["group_id"]) > parseInt(max))
                        max = groups[i]["group_id"];
                }
                console.log("Bigger id is: " + max);
                if (max === undefined) {
                    console.log("There are no groups stored on the database. Group_id will be 1.")
                    create =
                        {
                            title: data.title,
                            group_id: 1,
                            users: [
                                { api_id: data.api_id }
                            ]
                        }

                    var new_group = new Group(create);
                    new_group.save()
                        .then(function (result) {
                            console.log("Group \'" + result.title + "\' successfully created under id " + result.group_id);
                            res.send(result);
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.send("mongo_error");
                        });
                } else {
                    console.log("There are groups stored on the database. Group_id will be " + ++max)
                    create =
                        {
                            title: data.title,
                            group_id: max,
                            users: [
                                { api_id: data.api_id }
                            ]
                        }

                    var new_group = new Group(create);
                    new_group.save()
                        .then(function (result) {
                            console.log("Group \'" + result.title + "\' successfully created under id " + result.group_id);
                            res.send(result);
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.send("mongo_error");
                        });
                }
            }
        });
    });

    application.post("/join_group", function (req, res) {
        var data = req.body;

        var query =
            {
                group_id: parseInt(data.group_id)
            }
        Group.findOne(query, function (mongo_error, result) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                if (result === null) {
                    console.log("There is no group with group_id \'" + data.group_id + "\' stored in the database.");
                    res.send("group_does_not_exist");
                } else {
                    console.log("There is a group with group_id \'" + result.group_id + "\' stored in the database.");
                    var update_group = new Group()
                }
            }
        })

    });
}