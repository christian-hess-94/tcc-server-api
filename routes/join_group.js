module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/join_group", function (req, res) {
        var data = req.body;

        var query =
            {
                group_id: parseInt(data.group_id)
            }
        Group.findOne(query, function (mongo_error, result) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                console.log(result.users)
                if (result === null) {
                    console.log("There is no group with group_id \'" + data.group_id + "\' stored in the database.");
                    res.send("group_does_not_exist");
                } else {
                    console.log("Group with group_id \'" + result.group_id + "\' stored in the database is called '" + result.title + "' and has " + result.users.length + " users.");
                    var update = {
                        "title": result.title,
                        "group_id": result.group_id,
                        "users": [],
                        "params": []
                    }
                    for (var i = 0; i < result.users.length; i++) {
                        update.users.push(result.users[i])
                    }
                    var add = 
                    {
                        "_id": result._id,
                        "api_id": data.api_id
                    }
                    update.users.push(add);
                    for (var i = 0; i < result.params.length; i++) {
                        update.params.push(result.params[i])
                    }
                    console.log(update);
                    var update_group = new Group(update);
                    update_group.save()
                        .then(function (result) {
                            console.log("User " + data.api_id + " was added to group "+ result.group_id + " successfully.");
                            res.send(result);
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.send("mongo_error");
                        });
                }
            }
        })

    });
}