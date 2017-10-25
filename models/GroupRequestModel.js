var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupRequestSchema = new Schema({
    user: String,
    sender_api_id: String,
    group_id: String,
    status: String
});

module.exports = mongoose.model('group_requests', GroupRequestSchema);