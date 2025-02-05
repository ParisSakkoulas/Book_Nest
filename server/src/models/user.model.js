const mongoose = require('mongoose');
const { USER_STATUS } = require('./user.status.constants');
const { Schema } = mongoose;

const userSchema = new Schema({


    email:
    {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already in use'],
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
            },
            message: 'Invalid email address format',
        },
        trim: true
    },

    password:
    {
        type: String,
        required: [true, 'Password is required'],
        validate: {
            validator: function (value) {
                // Password requirements
                const minLength = 8;
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumbers = /\d/.test(value);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                // Check all conditions
                return value.length >= minLength &&
                    hasUpperCase &&
                    hasLowerCase &&
                    hasNumbers &&
                    hasSpecialChar;
            },
            message: props => {
                const errors = [];

                if (props.value.length < 8) errors.push('at least 8 characters');
                if (!/[A-Z]/.test(props.value)) errors.push('one uppercase letter');
                if (!/[a-z]/.test(props.value)) errors.push('one lowercase letter');
                if (!/\d/.test(props.value)) errors.push('one number');
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(props.value)) errors.push('one special character');

                return `Password must contain ${errors.join(', ')}`;
            },
        }
    },

    role:
    {
        type: String,
        enum: ['USER', 'CUSTOMER', 'ADMIN'],
        default: 'USER'
    },



    status: {
        type: String,
        enum: Object.values(USER_STATUS),
        default: USER_STATUS.PENDING_VERIFICATION
    },

    uniqueString:
    {
        type: String,
        required: true,
    },



}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
