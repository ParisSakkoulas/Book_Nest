const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({

    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ],

    totalAmount:
    {
        type: Number,
        default: 0
    }, // Calculated total price


});

module.exports = mongoose.model('Cart', CartSchema);
