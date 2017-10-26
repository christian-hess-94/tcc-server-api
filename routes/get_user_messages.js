module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/get_user_messages", function (req, res) {
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

}