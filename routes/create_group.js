module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/create_group", function (req, res) {
        var data = req.body;

        var create = {};

        var parsed_params = JSON.parse("[]");
        Group.find(function (mongo_error, groups) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                var max;
                for (var i = 0; i < groups.length; i++) {
                    if (!max || parseInt(groups[i]["group_id"]) > parseInt(max))
                        max = groups[i]["group_id"];
                }
                console.log("Bigger id is: " + max);
                if (max === undefined) {
                    console.log("There are no groups stored on the database. Group_id will be 1.")
                    create = {
                        title: data.title,
                        group_id: 1,
                        users: [{
                            api_id: data.api_id
                        }],
                        params: parsed_params
                    }

                    var new_group = new Group(create);
                    new_group.save()
                        .then(function (result) {
                            console.log("Group \'" + result.title + "\' successfully created under id " + result.group_id);
                            res.send(result);
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.send("mongo_error");
                        });
                } else {
                    console.log("There are groups stored on the database. Group_id will be " + ++max)
                    create = {
                        title: data.title,
                        group_id: max,
                        users: [{
                            api_id: data.api_id
                        }],
                        params: parsed_params
                    }

                    var new_group = new Group(create);
                    console.log(new_group);
                    new_group.save()
                        .then(function (result) {
                            console.log("Group \'" + result.title + "\' successfully created under id " + result.group_id);
                            res.send(result);
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.send("mongo_error");
                        });
                }
            }
        });
    });
}