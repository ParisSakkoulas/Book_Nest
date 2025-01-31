// costumer routes
const express = require('express');
const { addToCart, removeFromCart, changeItemQuantity, getCart, updateCustomer } = require('../controllers/cart.controller');
const { cartAuthMiddleware } = require('../middlewares/cartAuth.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');




const router = express.Router();

// Route: add item to cart
router.post('/items', [cartAuthMiddleware], addToCart);

// Route: remove item from cart
router.delete('/items/:bookId', [cartAuthMiddleware], removeFromCart);

// Route: change item quantity
router.patch('/items/:bookId', [cartAuthMiddleware], changeItemQuantity);

// Route: get single cartt
router.get('/', [cartAuthMiddleware], getCart);


module.exports = router;