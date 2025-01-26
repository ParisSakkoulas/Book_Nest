// costumer routes
const express = require('express');
const { addToCart, removeFromCart, changeItemQuantity, getCart, updateCustomer } = require('../controllers/cart.controller');
const { cartAuthMiddleware } = require('../middlewares/cartAuth.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');


const router = express.Router();

// Route: add item to cart
router.post('/items', [authenticateToken, cartAuthMiddleware], addToCart);
router.delete('/items/:bookId', [authenticateToken, cartAuthMiddleware], removeFromCart);
router.patch('/items/:bookId', [authenticateToken, cartAuthMiddleware], changeItemQuantity);
router.get('/', [authenticateToken, cartAuthMiddleware], getCart);



/*



router.get('/cart/', getCart);



// Route: get customers
router.get('/all', authenticateToken, requireAdmin, getCustomers);


// Route: get single customer
router.get('/:customerId', authenticateToken, requireAdmin, getSingleCustomer);


// Route: delete single customer
router.delete('/:customerId', authenticateToken, requireAdmin, deleteCustomer);


// Route: update customer
router.put('/:customerId', authenticateToken, updateCustomer);
*/


module.exports = router;