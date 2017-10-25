module.exports = function (application) {
    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/init", function (req, res) {
        var data = req.body;
        console.log("Init with user: " + data.user);

        var query = {
            user: data.user,
            password: data.password
        }

        var create = {};

        console.log(data);
        var parsed_params = JSON.parse(data.params);
        User.findOne(query, function (mongo_error, returned_user) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                if (returned_user == null) {
                    console.log("User doesn't exist. Adding this user to the database and giving it an api_id.")
                    //Get the last id in the database
                    User.find(function (mongo_error, users) {
                        if (mongo_error) {
                            console.log("Erro when connecting to database: " + mongo_error);
                            res.send("mongo_error");
                        } else {
                            var max;
                            for (var i = 0; i < users.length; i++) {
                                if (!max || parseInt(users[i]["api_id"]) > parseInt(max))
                                    max = parseInt(users[i]["api_id"]);
                            }
                            console.log("Bigger id is: " + max);
                            if (max === undefined) {
                                console.log("There are no users stored on the database. api_id will be 1.")
                                create = {
                                    "api_id": 1,
                                    "user": data.user,
                                    "password": data.password,
                                    "params": parsed_params
                                }
                                console.log(create);
                                var new_user = new User(create);
                                new_user.save()
                                    .then(function (result) {
                                        console.log('\n\nUsuario criada com sucesso - id: ' + result._id + ' usuario: ' + result.user + "\n\n");
                                        res.send(result);
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                        res.send("mongo_error");
                                    });
                            } else {
                                console.log("There are users stored on the database. api_id will be " + ++max);
                                create = {
                                    "api_id": max,
                                    "user": data.user,
                                    "password": data.password,
                                    "params": parsed_params
                                }
                                var new_user = new User(create);
                                new_user.save()
                                    .then(function (result) {
                                        console.log('Usuario criada com sucesso - id: ' + result._id + ' usuario: ' + result.user);
                                        res.send(result);
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                        res.send("mongo_error");
                                    });
                            }
                        }
                    });


                } else {
                    console.log("User already exists. Checking validity of firebase token.");
                    console.log(parsed_params.firebase);
                    console.log(returned_user.params.firebase);
                    if (returned_user.params.firebase === parsed_params.firebase) {
                        console.log("Firebase token is valid. User authenticated. Returning data.")
                        res.send(returned_user);
                    } else {
                        returned_user.params.firebase = parsed_params.firebase;
                        returned_user.save()
                            .then(function (result) {
                                console.log("New firebase token, saved to database. Sending data.")
                                res.send(result);
                            })
                            .catch(function (err_update) {
                                console.log("Error while trying to save new firebase token to database: " + err_update);
                                res.send("mongo_error");
                            })
                    }
                }
            }
        });
    })
    
}