var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
    title: String,
    group_id: String,
    users: [{
        api_id: String,
    }],
    params: [{
        key: String
    }]
});

module.exports = mongoose.model('groups', GroupSchema);