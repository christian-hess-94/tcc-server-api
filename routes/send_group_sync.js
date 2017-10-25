module.exports = function (application) {
    var http = require("http");
    var request = require("request");

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");


    application.post("/send_group_sync", function (req, res) {
        var data = req.body;

        console.log(data);

        var new_message =
            {
                sender_api_id: data.sender_api_id,
                sender_user: data.sender_user,
                group_id: data.group_id,
                msg: data.msg,
                status: "not_read",
                params: '[]'
            }

        var message = new Message(new_message);
        message.save()
            .then(function (result) {
                console.log("Message \'" + data.msg + "\' was saved from " + data.sender_api_id + " to group_id " + data.group_id);
                console.log("Message \'" + data.msg + "\' was saved from " + data.sender_api_id + " to group_id " + data.group_id);
                console.log("Message \'" + data.msg + "\' was saved from " + data.sender_api_id + " to group_id " + data.group_id);
                res.send(result);
            })
            .catch(function (mongo_error) {
                console.log("Error while trying to save new async_message to database: " + mongo_error);
                res.send("mongo_error");
            });
    });
}