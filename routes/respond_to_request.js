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

        GroupRequest.findOne(query, function (mongo_error, group_request) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                var group_query =
                    {
                        group_id: data.group_id
                    }
                console.log("Group_query: ");
                console.log(group_query);
                console.log("\n\n");


                if (data.response === "accepted") {
                    Group.findOne(group_query, function (error_mongo, group_before) {
                        if (mongo_error) {
                            console.log("Erro when connecting to database: " + mongo_error);
                            res.send("mongo_error");
                        } else {
                            console.log("Group before: ");
                            console.log(group_before);
                            console.log("\n\n");
                            var group_after =
                                {
                                    users: group_before.users
                                }
                            group_after.users.push({ api_id: data.sender_api_id });
                            console.log("Group after: ");
                            console.log(group_after);
                            console.log("\n\n");
                            group_before.update(group_after, function (error_mongo, updated) {
                                if (mongo_error) {
                                    console.log("Update Erro when connecting to database: " + mongo_error);
                                    res.send("mongo_error");
                                } else {
                                    console.log("Updated: ");
                                    console.log(updated);
                                    console.log("\n\n");
                                    GroupRequest.remove(group_request, function (mongo_error, result) {
                                        if (mongo_error) {
                                            console.log("Erro when connecting to database: " + mongo_error);
                                            res.send("mongo_error");
                                        } else {
                                            console.log("Request successfully deleted.");
                                            res.send(data.response);
                                        }
                                    })

                                }
                            });
                        }
                    });
                } else {
                    var new_group_request =
                        {
                            status: "rejected"
                        }
                    group_request.update(new_group_request, function (mongo_error, updated) {
                        if (mongo_error) {
                            console.log("Update Erro when connecting to database: " + mongo_error);
                            res.send("mongo_error");
                        } else {
                            console.log("User rejected to join group.");
                            res.send(data.response);
                        }
                    });
                }
            }
        });
    });
}