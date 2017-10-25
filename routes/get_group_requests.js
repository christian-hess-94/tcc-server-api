module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");
    var GroupRequest = require("../models/GroupRequestModel");

    application.post("/get_group_requests", function (req, res) {
        var data = req.body;
        console.log("Getting requests for group " + data.group_id);
        var query = {
            group_id: data.group_id
        }
        GroupRequest.find(query, function (mongo_error, group_requests) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                console.log("Found " + group_requests.length + " requests for group " + data.group_id);
                res.send(group_requests);
            }
        })
    });
}