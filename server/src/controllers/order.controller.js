

const User = require('../models/user.model');
const Cart = require('../models/cart.models');
const Book = require('../models/product.model');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');





// Controller: create order
exports.createOrder = async (req, res) => {
    try {

        console.error('CREATE ORDER:', req.user);

        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];
        const { shippingAddress, visitorInfo } = req.body;

        // Find cart based on user type
        const cart = await Cart.findOne(userId ? { userId } : { sessionId })
            .populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).send({ error: 'Cart is empty' });
        }
        console.error('shippingAddress:', shippingAddress);
        console.error('visitorInfo:', visitorInfo);

        // Create order based on user type
        const order = new Order({
            userId: userId || null,
            sessionId: !userId ? sessionId : null,
            items: cart.items,
            totalAmount: cart.totalAmount,
            shippingAddress: shippingAddress.shippingAddress,
            // Only include visitorInfo for non-authenticated users
            visitorInfo: !userId ? visitorInfo : undefined,
            status: 'Pending',
            createdAt: new Date()
        });

        // Validate stock levels before creating order
        for (const item of cart.items) {
            const book = await Book.findById(item.productId);
            if (!book || book.stock < item.quantity) {
                return res.status(400).send({
                    error: `Insufficient stock for book: ${book ? book.title : 'Unknown'}`
                });
            }

            // Decrease stock
            await Book.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        await order.save();
        await Cart.findByIdAndDelete(cart._id);

        // Return populated order
        const populatedOrder = await Order.findById(order._id)
            .populate('items.productId', 'title author price imageUrl');

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller: get order
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];

        // Populate all required fields for the order
        const order = await Order.findById(orderId)
            .populate({
                path: 'items.productId',
                select: 'title author imageUrl price'
            })
            .populate({
                path: 'userId',
                select: 'firstName lastName email'
            })
            .lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // If user is admin, they can view any order
        if (req.user?.role === 'ADMIN') {
            return res.status(200).json({
                ...order,
                isEditable: true
            });
        }

        // Authorization check for regular users
        if (userId) {
            if (order.userId?._id.toString() !== userId) {
                return res.status(403).json({
                    error: 'Not authorized to view this order',
                    details: 'User ID mismatch'
                });
            }
        } else if (sessionId) {
            if (order.sessionId !== sessionId) {
                return res.status(403).json({
                    error: 'Not authorized to view this order',
                    details: 'Session ID mismatch'
                });
            }
        } else {
            return res.status(403).json({
                error: 'Not authorized to view this order',
                details: 'No valid authorization method provided'
            });
        }

        // Format the response with all necessary data
        const formattedOrder = {
            _id: order._id,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items.map(item => ({
                productId: {
                    _id: item.productId._id,
                    title: item.productId.title,
                    author: item.productId.author,
                    imageUrl: item.productId.imageUrl || '/assets/images/book-default.png',
                    price: item.productId.price
                },
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: {
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                zipCode: order.shippingAddress.zipCode,
                country: order.shippingAddress.country
            },
            isEditable: order.status === 'Pending' || order.status === 'Processing',
            userId: userId ? {
                _id: order.userId?._id,
                firstName: order.userId?.firstName,
                lastName: order.userId?.lastName,
                email: order.userId?.email
            } : null
        };

        res.status(200).json(formattedOrder);

    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Controller: get user s order 
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

// Controller: get my orders for users
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

// Controller: change order status (admin)
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

// Controller: cancel order status (admin)
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

        res.status(200).json({
            order: order,
            message: 'Order canceled'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller: get all orderss (admin)
exports.getAllOrders = async (req, res) => {

    try {


        const { email, phone } = req.query;

        let userIds = [];
        let query = {};

        // If email filter is provided,
        if (email) {
            const users = await User.find({
                email: { $regex: email, $options: 'i' }
            }).select('_id');
            userIds = users.map(user => user._id);
            query.userId = { $in: userIds };
        }


        //If phone is provide
        if (phone) {
            const customers = await Customer.find({
                phoneNumber: { $regex: phone, $options: 'i' }
            }).select('user');
            const customerUserIds = customers.map(customer => customer.user);


            if (email) {
                query.userId = { $in: userIds.filter(id => customerUserIds.includes(id)) };
            } else {
                query.userId = { $in: customerUserIds };
            }
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('userId', 'email')
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