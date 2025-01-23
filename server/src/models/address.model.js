const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddressSchema = new Schema({

    street:
    {

        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },

    city:
    {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },

    postalCode:
    {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true
    },

    country:
    {
        type: String,
        required: [true, 'Country is required'],
        default: 'Greece',
        trim: true
    }


});

module.exports = mongoose.model('Address', AddressSchema);
