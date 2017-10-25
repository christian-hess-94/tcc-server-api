module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

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
}