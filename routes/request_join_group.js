module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");
    var GroupRequest = require("../models/GroupRequestModel");

    application.post("/create_update_request_join_group", function (req, res) {
        var data = req.body;
        console.log("Requested to join group " + data.group_id + " with type " + data.type);

        var query =
            {
                group_id: data.group_id,
                sender_api_id: data.sender_api_id
            }

        GroupRequest.findOne(query, function (mongo_error, request) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                if (request == null) {
                    if (data.type === "CREATE") {
                        console.log("No request. Creating new request.")
                        var new_request = new GroupRequest({
                            group_id: data.group_id,
                            sender_api_id: data.sender_api_id,
                            user: data.user,
                            status: "pending"
                        });
                        new_request.save()
                            .then(function (result) {
                                console.log("Request successfully created under id " + result._id);
                                res.send("pending");
                            })
                            .catch(function (err) {
                                console.log(err);
                                res.send("mongo_error");
                            });
                    } else {
                        console.log("Update called and there is no request which means that the user has been authenticated. Sending accepted back to device\n\n");
                        res.send("accepted");
                    }
                } else {
                    console.log("There is a pending request for this user, that hasn't been viewed. Checking to see the request's status\n")
                    if (request.status === "rejected") {
                        if (data.type === "CREATE") {
                            console.log("User has been rejected to join the group. Type is CREATE, so the request will be updated to pending.\n")
                            var new_request = new GroupRequest({
                                status: "pending"
                            });

                            request.update(new_request, function (mongo_error, updated) {
                                if (mongo_error) {
                                    console.log("Update Erro when connecting to database: " + mongo_error);
                                    res.send("mongo_error");
                                } else {
                                    console.log("Request has been updated as pending. Sending pending back to device in CREATE mode.\n\n")
                                    res.send("pending");
                                }
                            });
                        } else {
                            console.log("User has been rejected to join the group. Type is UPDATE, so the request will be removed from DB.\n")
                            GroupRequest.remove(request, function (mongo_error, updated) {
                                if (mongo_error) {
                                    console.log("Update Erro when connecting to database: " + mongo_error);
                                    res.send("mongo_error");
                                } else {
                                    console.log("Request has been successfully deleted from DB as the user was rejected. Sending rejected back in UPDATE mode\n\n")
                                    res.send("rejected");
                                }
                            })
                        }
                    } else if(request.status === "pending"){
                        console.log("The request hasn't been viewed yet. Sending pending back to device\n\n")
                        res.send("pending");
                    }


                    /*if (request.status == "rejected") {
                        console.log("User accepted. Deleting current request and sending \"true\" back to device.");
                        GroupRequest.remove(request, function (mongo_error, result) {
                            if (mongo_error) {
                                console.log("Erro when connecting to database: " + mongo_error);
                                res.send("mongo_error");
                            } else {
                                console.log("Request successfully deleted.");
                                res.send("true");
                            }
                        })
                    } else if (request.status == "rejected") {
                        console.log("User rejected. Deleting current request and sending \"false\" back to device.");
                        GroupRequest.remove(request, function (mongo_error, result) {
                            if (mongo_error) {
                                console.log("Erro when connecting to database: " + mongo_error);
                                res.send("mongo_error");
                            } else {
                                console.log("Request successfully deleted.");
                                res.send("false");
                            }
                        })
                    } else {
                        console.log("User still hasn't been accepted into group " + data.group_id);
                        res.send("false");

                    }*/
                }
            }
        });

    });
}