module.exports = function (application) {

    var http = require('http');
    var request = require('request');

    var User = require("../models/UserModel");
    var Message = require("../models/MessageModel");
    var Group = require("../models/GroupModel");

    application.post("/get_all_groups", function (req, res) {

        var root = [];

        Group.find(function (mongo_error, groups) {
            if (mongo_error) {
                console.log("Erro when connecting to database: " + mongo_error);
                res.send("mongo_error");
            } else {
                console.log("Got all groups: " + groups.length);
                if (groups.length === 0) {
                    console.log("User is not part of any groups. Sending empty no_groups flag.")
                    res.send("no_groups");
                } else {
                    console.log("Getting all users");
                    User.find(function (mongo_error, all_users) {
                        console.log("Got " + all_users.length + " users");

                        console.log("Looping through all groups");
                        for (var i = 0; i < groups.length; i++) {
                            root.push({
                                "title": groups[i].title,
                                "group_id": groups[i].group_id,
                                "params": groups[i].params,
                                "users": []
                            })
                            console.log(root);
                            var this_group = groups[i];
                            var new_group = root[i];
                            console.log("Getting users from group " + this_group.group_id);
                            var group_users = groups[i].users;
                            console.log("Group " + this_group.group_id + " has " + group_users.length + " users.");
                            console.log("Swapping entire user objects by complete counterparts in the Users collection.")
                            for (var j = 0; j < group_users.length; j++) {
                                for (var k = 0; k < all_users.length; k++) {
                                    console.log("Checking user " + group_users[j].api_id + " with ")
                                    console.log("user " + all_users[k].api_id + " and ")
                                    if (group_users[j].api_id === all_users[k].api_id) {
                                        console.log("it was found.");
                                        new_group.users.push(all_users[k]);
                                        break;
                                    }
                                }
                            }
                        }
                        res.send(root);
                    })
                }
            }
        })
    });
}