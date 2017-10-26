module.exports = function (application) {
    var http = require("http");
    var request = require("request");

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");


    application.post("/send_sync", function (req, res) {
        // recieves message, both ids of the sender and receiver, add the status as not_read, and an option to redirect to the send_async        
        // to send a message to the same receiver_api_id so that it can call the receive_sync route
        var data = req.body;
        console.log("Sending synchronous message from " + data.sender_user + " to " + data.receiver_api_id);

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

}