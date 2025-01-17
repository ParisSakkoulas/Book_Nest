const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({

    name:
    {
        type: String,
        required: true
    },

    email:
    {
        type: String,
        required: true,
        unique: true
    },

    phone:
    {
        type: String
    },

    address:
    {
        type: String
    },


});

module.exports = mongoose.model('Customer', CustomerSchema);
