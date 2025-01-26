
const User = require('../models/user.model');
const Cart = require('../models/cart.models');
const Book = require('../models/product.model');


const bcrypt = require('bcrypt');





exports.addToCart = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).send({ error: 'Session ID required for guest cart' });
        }

        let cart = await Cart.findOne(userId ? { userId } : { sessionId });
        if (!cart) {
            cart = new Cart({
                userId: userId || null,
                sessionId: userId ? null : sessionId,
                items: []
            });
        }

        let totalAmount = 0;
        for (const item of items) {
            const book = await Book.findById(item.bookId);

            if (!book) {
                return res.status(404).send({ error: `Book not found` });
            }

            if (book.stock < item.quantity) {
                return res.status(400).send({ error: 'Insufficient stock' });
            }

            // Check if book already exists in cart
            const existingItem = cart.items.find(cartItem =>
                cartItem.productId.toString() === book._id.toString()
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + item.quantity;
                if (newQuantity > book.stock) {
                    return res.status(400).send({ error: 'Insufficient stock for combined quantity' });
                }
                existingItem.quantity = newQuantity;
                totalAmount += book.price * item.quantity;
            } else {
                const itemTotal = book.price * item.quantity;
                totalAmount += itemTotal;
                cart.items.push({
                    productId: book._id,
                    quantity: item.quantity,
                    price: book.price
                });
            }
        }

        cart.totalAmount = totalAmount;
        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.productId', 'title author price imageUrl');

        res.status(200).json(populatedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.removeFromCart = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).send({ error: 'Session ID required for guest cart' });
        }

        let cart = await Cart.findOne(userId ? { userId } : { sessionId });
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== bookId);
        cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        console.log(cart)

        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}


exports.changeItemQuantity = async (req, res) => {

    try {
        const { bookId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).send({ error: 'Session ID required for guest cart' });
        }

        let cart = await Cart.findOne(userId ? { userId } : { sessionId });
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === bookId);
        if (!item) {
            return res.status(404).send({ error: 'Item not found in cart' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send({ error: 'Book not found' });
        }

        console.log(book)
        if (book.stock < quantity) {
            return res.status(400).send({ error: 'Insufficient stock' });
        }

        item.quantity = quantity;
        cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        await cart.save();
        const populatedCart = await Cart.findById(cart._id)
            .populate('items.productId', 'title author price imageUrl');

        res.status(200).json(populatedCart);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }

}

exports.getCart = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).send({ error: 'Session ID required for guest cart' });
        }

        const cart = await Cart.findOne(userId ? { userId } : { sessionId })
            .populate('items.productId', 'title author price imageUrl');

        if (!cart) {
            return res.status(200).json({
                items: [],
                totalAmount: 0
            });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};