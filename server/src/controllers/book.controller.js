const Book = require('../models/product.model');
const mongoose = require('mongoose');


exports.createBook = async (req, res) => {

    try {
        const { title, author, isbn, price, description, category, stock } = req.body;

        // Check if book with ISBN already exists
        const existingBook = await Book.findOne({ isbn });
        if (existingBook) {
            return res.status(400).json({
                success: false,
                message: 'A book with this ISBN already exists'
            });
        }

        // Create new book
        const book = await Book.create({
            title,
            author,
            isbn,
            price,
            description,
            category,
            stock,
            imageUrl: req.body.imageUrl,
            publishDate: req.body.publishDate
        });

        return res.status(201).json({
            success: true,
            data: book
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating book',
            error: error.message
        });
    }
};

exports.getBookById = async (req, res) => {


    try {


        const bookId = req.params.bookId;

        const bookFound = await Book.findById(bookId);

        if (!bookFound) {
            return res.status(400).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            book: bookFound,
            message: 'Book found'
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

}


exports.getBooks = async (req, res) => {


    try {


        const query = {};
        const { category, search, minPrice, maxPrice, status } = req.query;

        // Build filter conditions
        if (category) query.category = category;
        if (status) query.status = status;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }


        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },

            ];
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Sorting
        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }

        const books = await Book.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: books,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: books.length,
                totalRecords: total
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving books',
            error: error.message
        });
    }
};


// Controller: Delete book
exports.deleteBook = async (req, res) => {

    try {

        const bookToDeleteId = req.params.bookId;

        // Find book with this id
        const bookToDelete = await Book.findById(bookToDeleteId);

        if (!bookToDelete) {
            return res.status(404).json({ message: "Book not found" });
        }


        const deletedBook = await Book.findByIdAndDelete(bookToDeleteId);
        // If customer deleted
        return res.json({
            message: "Book deleted successfully",
            book: deletedBook
        });




    } catch (err) {
        return res.status(500).json({
            message: "Error deleting book",
            error: err.message
        });

    }

}


// Controller: Update book
exports.updateBook = async (req, res) => {

    try {

        const bookToUpdateId = req.params.bookId;
        const { title, author, isbn, price, description, category, stock } = req.body;


        // Find book with this id
        const bookToUpdate = await Book.findById(bookToUpdateId);

        if (!bookToUpdate) {
            return res.status(404).json({ message: "Book not found" });
        }


        // Check if ISBN exists but belongs to a different book
        const existingBook = await Book.findOne({
            isbn,
            _id: { $ne: bookToUpdateId }
        });

        if (existingBook) {
            return res.status(400).json({
                message: "ISBN already exists for another book"
            });
        }


        const updatedBook = await Book.findByIdAndUpdate(
            bookToUpdateId,
            req.body,
            { new: true }
        );


        return res.json({
            message: "Book updated successfully",
            updatedBook: updatedBook
        });




    } catch (err) {
        return res.status(500).json({
            message: "Error updating book",
            error: err.message
        });

    }

}