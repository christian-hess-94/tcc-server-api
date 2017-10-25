module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");
    var GroupRequest = require("../models/GroupRequestModel");

    application.post("/create_update_request_join_group", function (req, res) {
        var data = req.body;
        console.log("Requested to join group " + data.group_id);

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
                    console.log("No request. Creating new request.")
                    var new_request = new GroupRequest({
                        group_id: data.group_id,
                        sender_api_id: data.sender_api_id,
                        user: data.user,
                        status: "not_accepted"
                    });
                    new_request.save()
                        .then(function (result) {
                            console.log("Request successfully created under id " + result._id);
                            res.send("false");
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.send("mongo_error");
                        });
                } else {
                    console.log("Found a request.")
                    if (request.status == "accepted") {
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

                    }
                }
            }
        });

    });
}