var express = require("express");
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var consign = require('consign');

var secret = require('./secret');



var options = {
    useMongoClient: true
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose.connect(secret.database, options)
    .then(function () {
        console.log("Conectou no banco Mongoose");
    })

    .catch(function (err) {
        console.log("Erro ao abrir o servidor:\n\n" + err);
    });

app.listen("80", function () {
    console.log("Server running on port 80");
});

consign()
.include('routes')
.into(app);
module.exports = app;