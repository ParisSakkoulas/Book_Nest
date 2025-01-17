const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

    customerId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', required: true
    },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ],

    totalAmount:
    {
        type: Number,
        required: true
    }, // Calculated total price

    status:
    {
        type: String,
        default: 'Pending'
    }, // e.g., Pending, Completed, Cancelled

});

module.exports = mongoose.model('Order', OrderSchema);
