const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({


    email:
    {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
            },
            message: 'Invalid email address format',
        },
    },

    password:
    {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(value);
            },
            message: 'Weak password. Should be at least 8 characters long and include at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
        },
    },

    role:
    {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
