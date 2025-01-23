const mongoose = require('mongoose');
const { CUSTOMER_STATUS } = require('./customer.status.constants');
const { Schema } = mongoose;

const CustomerSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    firstName:
    {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },

    lastName:
    {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },

    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\+?[\d\s-]{10,}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },

    address:
    {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },

    customerStatus: {
        type: String,
        enum: Object.values(CUSTOMER_STATUS),
        default: CUSTOMER_STATUS.REGISTERED
    },

    isActive:
    {
        type: Boolean,
        default: true
    }

},
    {
        timestamps: true
    });


// Virtual for full name
CustomerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Customer', CustomerSchema);
