const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({

    name:
    {
        type: String,
        required: true
    },

    description:
    {
        type: String
    },

    price:
    {
        type: Number,
        required: true
    },

    imageUrl:
    {
        type: String
    }, // URL for the product image

    stock:
    {
        type: Number,
        default: 0
    },

});

module.exports = mongoose.model('Product', ProductSchema);
