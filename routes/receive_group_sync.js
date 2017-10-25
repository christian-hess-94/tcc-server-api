module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/receive_group_sync", function (req, res) {
        var data = req.body;

        console.log(data);
        var query = {
            group_id: data.group_id
        }
        Message.find(query, function (error, messages) {
            if (error) {
                console.log("There was an error trying to get the Messages from the database: " + error)
                res.send("mongo_error");
            } else {
                if (messages.length === 0) {
                    console.log("No sync messages found for group with group_id " + data.group_id);
                    res.send("no_messages");
                } else {
                    console.log(messages.length + " sync messages found for group with group_id " + data.group_id);
                    for (var i = 0; i < messages.length; i++) {
                        var updatemessage = messages[i];
                        updatemessage["status"] = "read";
                        console.log(messages);
                    }
                    res.send(messages);
                }
            }
        });
    });
}