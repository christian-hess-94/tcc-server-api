module.exports = function (application) {
    var http = require("http");
    var request = require("request");

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/get_users", function (req, res) {
        var data = req.body;
        console.log(data.user + " wants to get all users");

        var query = {}

        User.find(function (mongo_error, users) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                console.log("Users found: " + users.length);
                res.send(users);
            }
        });
    });
}