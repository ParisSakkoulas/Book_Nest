// costumer routes
const express = require('express');
const { createOrder, getAllOrders, cancelOrder, getOrderById, getUserOrders, getMyOrders, updateOrderStatus } = require('../controllers/order.controller');
const { cartAuthMiddleware } = require('../middlewares/cartAuth.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');


const router = express.Router();


// Route: create order
router.post('/create', [cartAuthMiddleware, cartAuthMiddleware], createOrder);

// Route: get my orders (users)
router.get('/myOrders', authenticateToken, getMyOrders);

// Route: get all orders (admin)
router.get('/all', [authenticateToken, requireAdmin], getAllOrders);

// Route: get single order
router.get('/:orderId', [cartAuthMiddleware], getOrderById);

// Route: get user orders
router.get('/user/:userId', [authenticateToken, requireAdmin], getUserOrders);

// Route: change order status
router.patch('/:orderId/status', [authenticateToken, requireAdmin], updateOrderStatus);

// Route: cancel order status
router.delete('/:orderId', [authenticateToken, cartAuthMiddleware], cancelOrder);





module.exports = router;