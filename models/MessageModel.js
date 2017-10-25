var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    sender_api_id: String,
    sender_user: String,
    group_id: String,
    msg: String,
    title: String,
	body: String,
    receiver_api_id: String,
    status: String,
    type: String
});

module.exports = mongoose.model('messages', MessageSchema);