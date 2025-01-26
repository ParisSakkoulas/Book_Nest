const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({

    //For users
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    //For visitors
    sessionId:
    {
        type: String,
        required: function () {
            return !this.userId;
        }
    },

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],

    totalAmount:
    {
        type: Number,
        default: 0
    },

    createdAt:
    {
        type: Date,
        default: Date.now,
    }

});

CartSchema.pre('save', function () {
    this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

module.exports = mongoose.model('Cart', CartSchema);
