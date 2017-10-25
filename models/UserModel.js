var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    api_id: String,
    user: {
        type: String,
        unique: true
    },
    password: String,
    params: {
        name: String,
        phone: String,
        firebase: String
    }
});

module.exports = mongoose.model('users', UserSchema);