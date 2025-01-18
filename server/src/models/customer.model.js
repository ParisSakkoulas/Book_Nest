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

    address:
    {
        street: String,
        city: String,
        postalCode: String,
        country: String
    },

    notes:
    {
        type: String,
        trim: true
    },

    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    createdBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
