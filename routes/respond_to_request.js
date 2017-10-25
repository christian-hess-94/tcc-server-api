module.exports = function (application) {
    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");
    var GroupRequest = require("../models/GroupRequestModel");

    application.post("/respond_to_request", function (req, res) {
        var data = req.body;

        console.log(data.response);

        var query =
            {
                _id: data._id
            }



        GroupRequest.findOne(query, function (mongo_error, request) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                console.log("Updating request: " + request)
                var update_request =
                    {
                        group_id: request.group_id,
                        sender_api_id: request.sender_api_id,
                        user: request.user,
                        status: data.response
                    }
                console.log(request);
                GroupRequest.update(update_request, function (mongo_error, updated) {
                    if (mongo_error) {
                        console.log("Update Erro when connecting to database: " + mongo_error);
                        res.send("mongo_error");
                    } else {
                        console.log("Updatedrequest: ")
                        console.log(updated);
                        var group_query =
                            {
                                group_id: data.group_id
                            }
                        Group.findOne(group_query, function (error_mongo, group) {
                            if (mongo_error) {
                                console.log("Erro when connecting to database: " + mongo_error);
                                res.send("mongo_error");
                            } else {
                                console.log("Got the group");
                                group.users.push({
                                    api_id: data.sender_api_id
                                })
                                Group.update(group, function (error_mongo, updated) {
                                    if (mongo_error) {
                                        console.log("Update Erro when connecting to database: " + mongo_error);
                                        res.send("mongo_error");
                                    } else {
                                        console.log("User has been " + data.response);
                                        res.send(data.response);
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    });
}