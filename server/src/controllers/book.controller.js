const Book = require('../models/product.model');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dbjabrvn8',
    api_key: '816645494981941',
    api_secret: 'Bd80OHGweqn2mYSpPlGqo_-XxhY'
});


// Controller: add new book
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

        let imageUrl = '';
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;

            // Delete file from local uploads folder
            fs.unlinkSync(req.file.path);
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
            imageUrl,
            publishDate: req.body.publishDate
        });

        return res.status(201).json({
            message: 'Book added successfully!',
            success: true,
            data: book
        });



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Error creating book',
            error: error.message
        });
    }
};

// Controller: get book
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

// Controller: get books
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
        const bookToUpdate = await Book.findById(bookToUpdateId);
        if (!bookToUpdate) {
            return res.status(404).json({ message: "Book not found" });
        }

        let imageUrl = bookToUpdate.imageUrl;
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
            // Delete file local
            fs.unlinkSync(req.file.path);
        }

        // Convert publish date string to Date object if provided
        let publishDate = bookToUpdate.publishDate;
        if ('publishDate' in req.body) {
            publishDate = req.body.publishDate ? new Date(req.body.publishDate) : null;
        }

        console.log(publishDate)

        const updateFields = {
            title: req.body.title ?? bookToUpdate.title,
            author: req.body.author ?? bookToUpdate.author,
            isbn: req.body.isbn ?? bookToUpdate.isbn,
            price: req.body.price ?? bookToUpdate.price,
            description: req.body.description ?? bookToUpdate.description,
            category: req.body.category ?? bookToUpdate.category,
            stock: req.body.stock ?? bookToUpdate.stock,
            imageUrl: req.file ? imageUrl : ('imageUrl' in req.body ? req.body.imageUrl : bookToUpdate.imageUrl),
            publishDate: publishDate
        };

        if (updateFields.isbn && updateFields.isbn !== bookToUpdate.isbn) {
            const existingBook = await Book.findOne({
                isbn: updateFields.isbn,
                _id: { $ne: bookToUpdateId }
            });

            if (existingBook) {
                return res.status(400).json({
                    message: "ISBN already exists for another book"
                });
            }
        }

        const updatedBook = await Book.findByIdAndUpdate(
            bookToUpdateId,
            updateFields,
            { new: true }
        );

        return res.json({
            message: "Book updated successfully",
            updatedBook: updatedBook
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error updating book",
            error: err.message
        });
    }
}