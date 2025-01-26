// costumer routes
const express = require('express');
const { createOrder, getAllOrders, cancelOrder, getOrderById, getUserOrders, getMyOrders, updateOrderStatus } = require('../controllers/order.controller');
const { cartAuthMiddleware } = require('../middlewares/cartAuth.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');


const router = express.Router();



router.post('/create', [authenticateToken, cartAuthMiddleware], createOrder);
router.get('/myOrders', authenticateToken, getMyOrders);
router.get('/all', [authenticateToken, requireAdmin], getAllOrders);
router.get('/:orderId', [authenticateToken, cartAuthMiddleware], getOrderById);
router.get('/user/:userId', [authenticateToken, requireAdmin], getUserOrders);
router.patch('/:orderId/status', [authenticateToken, requireAdmin], updateOrderStatus);
router.delete('/:orderId', [authenticateToken, cartAuthMiddleware], cancelOrder);



/*
router.get('/orders', [authenticateToken, cartAuthMiddleware], getAllOrders);
router.get('/orders/:orderId', [authenticateToken, cartAuthMiddleware], getOrderById);
router.get('/orders/user/:userId', [authenticateToken, cartAuthMiddleware], getUserOrders);
router.get('/orders/my-orders', authenticateToken, getMyOrders);
router.patch('/orders/:orderId/status', [authenticateToken, cartAuthMiddleware], updateOrderStatus);
router.delete('/orders/:orderId', [authenticateToken, cartAuthMiddleware], cancelOrder);
*/





module.exports = router;