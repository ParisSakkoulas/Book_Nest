// models/book.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSchema = new Schema({

    title:
    {
        type: String,
        required: [true, 'Book title is required'],
        trim: true
    },

    author:
    {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },

    isbn:
    {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true
    },

    price:
    {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },

    description:
    {
        type: String,
        required: [true, 'Book description is required']
    },

    category:
    {
        type: String,
        required: [true, 'Category is required']
    },

    stock:
    {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },

    imageUrl:
    {
        type: String
    },

    publishDate:
    {
        type: Date
    },

    status:
    {
        type: String,
        enum: ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'],
        default: 'AVAILABLE'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);