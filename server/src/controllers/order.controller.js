

const User = require('../models/user.model');
const Cart = require('../models/cart.models');
const Book = require('../models/product.model');
const Order = require('../models/order.model');






exports.createOrder = async (req, res) => {

    try {
        const userId = req.userData?.userId;
        const sessionId = req.headers['x-session-id'];
        const { shippingAddress } = req.body;

        const cart = await Cart.findOne(userId ? { userId } : { sessionId })
            .populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).send({ error: 'Cart is empty' });
        }

        const order = new Order({
            userId: cart.userId,
            sessionId: cart.sessionId,
            items: cart.items,
            totalAmount: cart.totalAmount,
            shippingAddress
        });

        await order.save();


        await Cart.findByIdAndDelete(cart._id);

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}


exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userData?.userId;
        const sessionId = req.headers['x-session-id'];

        const order = await Order.findById(orderId)
            .populate('items.productId')
            .populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify order belongs to user/session
        if ((userId && order.userId?.toString() !== userId) ||
            (sessionId && order.sessionId !== sessionId)) {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find({ userId })
            .populate('items.productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments({ userId });

        res.status(200).json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getMyOrders = async (req, res) => {
    try {

        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find({ userId })
            .populate('items.productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments({ userId });

        res.status(200).json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Only admin can update any order status
        order.status = status;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const allowedStatusesForCancel = ['Pending', 'Processing'];
        if (!allowedStatusesForCancel.includes(order.status)) {
            return res.status(400).json({
                error: 'Orders can only be cancelled while Pending or Processing'
            });
        }

        // Allow both order owner and admin to cancel
        if (order.userId.toString() !== req.user?.userId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to cancel this order' });
        }

        order.status = 'Cancelled';
        await order.save();

        // Return stock to inventory
        for (const item of order.items) {
            await Book.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAllOrders = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .populate('items.productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments();

        res.status(200).json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total
            }
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }

}