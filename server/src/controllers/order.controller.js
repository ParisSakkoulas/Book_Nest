

const User = require('../models/user.model');
const Cart = require('../models/cart.models');
const Book = require('../models/product.model');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');


const mongoose = require('mongoose');
const transporter = require('../config/email.config');




// Controller: create order
exports.createOrder = async (req, res) => {
    try {

        console.error('CREATE ORDER:', req.user);

        const userId = req.user?.userId;
        const sessionId = req.headers['x-session-id'];
        const { shippingAddress, visitorInfo } = req.body;

        // Find cart 
        const cart = await Cart.findOne(userId ? { userId } : { sessionId })
            .populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).send({ error: 'Cart is empty' });
        }


        // Create order
        const order = new Order({
            userId: userId || null,
            sessionId: !userId ? sessionId : null,
            items: cart.items,
            totalAmount: cart.totalAmount,
            shippingAddress: shippingAddress.shippingAddress,
            visitorInfo: !userId ? shippingAddress.visitorInfo : undefined,
            status: 'Pending',
            createdAt: new Date()
        });

        console.log(req.body)

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

        // Return order
        const populatedOrder = await Order.findById(order._id).populate('items.productId', 'title author price imageUrl').populate('userId', 'email');


        console.log(populatedOrder)


        //Send email to either user or customer for the order creation
        await exports.sendEmailForStatusOrder({ email: order.userId ? populatedOrder.userId.email : order.visitorInfo.email, order });


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

        const order = await Order.findById(orderId)
            .populate('userId', 'email')
            .populate('items.productId', 'title')

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(order);
        // Only admin can update any order status
        order.status = status;
        await order.save();

        await exports.sendEmailForStatusOrder({ email: order.userId.email, order });

        res.status(200).json(order);
    } catch (error) {
        console.log(error)
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
        const { email, phone, status, orderId, searchText, firstName, lastName } = req.query;

        let userIds = [];
        let query = {};

        console.log("First name ", searchText);
        console.log("last name", lastName);


        // If email is provided
        if (email) {

            let emailConditions = [];

            // fot the register user
            const users = await User.find({
                email: { $regex: email, $options: 'i' }
            }).select('_id');
            userIds = users.map(user => user._id);
            emailConditions.push({ userId: { $in: userIds } });


            // visitor email condition
            emailConditions.push({
                $and: [
                    { userId: null },
                    { 'visitorInfo.email': { $regex: email, $options: 'i' } }
                ]
            });
            query.$or = emailConditions;
        }

        // If phone is provided
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

        // if searchText is provide
        if (searchText) {
            if (mongoose.Types.ObjectId.isValid(searchText)) {
                query._id = new mongoose.Types.ObjectId(searchText);
            }
            else {
                let nameConditions = [];

                const nameParts = searchText.trim().split(/\s+/);
                console.log(nameParts.length)

                // Search for register user in customer modl
                const customers = await Customer.find({
                    $or: [
                        { firstName: { $regex: searchText, $options: 'i' } },
                        { lastName: { $regex: searchText, $options: 'i' } }
                    ]
                }).select('user');
                if (customers.length > 0) {
                    const customerUserIds = customers.map(customer => customer.user);
                    nameConditions.push({ userId: { $in: customerUserIds } });
                }

                //  Search for visitor name condition
                nameConditions.push({
                    $and: [
                        { userId: null },
                        {
                            $or: [
                                { 'visitorInfo.firstName': { $regex: searchText, $options: 'i' } },
                                { 'visitorInfo.lastName': { $regex: searchText, $options: 'i' } }
                            ]
                        }
                    ]
                });


                // Combined th query
                if (query.userId) {
                    query = {
                        $and: [
                            { userId: query.userId },
                            { $or: nameConditions }
                        ]
                    };
                } else {
                    query.$or = nameConditions;
                }
            }
        }

        // Add status filter if exists
        if (status) {
            query.status = status;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('userId', 'email')
            .populate('items.productId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get customer info for orders
        const ordersWithCustomerInfo = await Promise.all(orders.map(async (order) => {
            const orderObj = order.toObject();
            if (orderObj.userId) {
                const customer = await Customer.findOne({ user: orderObj.userId })
                    .select('firstName lastName phoneNumber');
                if (customer) {
                    orderObj.customerName = {
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        phoneNumber: customer.phoneNumber
                    };
                }
            }
            return orderObj;
        }));

        // Count orders result for pagination
        const total = await Order.countDocuments(query);

        res.status(200).json({
            orders: ordersWithCustomerInfo,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        });
    }
};

//Method for user about order status change
exports.sendEmailForStatusOrder = async ({ email, order }) => {
    try {


        console.log(email)
        const statusStyles = {
            'Pending': { color: '#FFA500', message: 'Your order has been received and is being reviewed.' },
            'Processing': { color: '#3498db', message: 'Your order is being processed and prepared for shipment.' },
            'Shipped': { color: '#2ecc71', message: 'Your order is on its way to you!' },
            'Delivered': { color: '#27ae60', message: 'Your order has been delivered successfully.' },
            'Cancelled': { color: '#e74c3c', message: 'Your order has been cancelled.' }
        };

        const statusInfo = statusStyles[order.status];

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Order Status Update - ${order.status} - BookNest`,
            html: `
                <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif;">
                    <tr>
                        <td align="center">
                            <table width="600px" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="padding: 30px; background-color: #86CBFC; border-radius: 10px 10px 0 0;">
                                        <h1 style="color: white; margin: 0;">BookNest</h1>
                                    </td>
                                </tr>

                                <!-- Status Update -->
                                <tr>
                                    <td align="center" style="padding: 30px;">
                                        <h2>Order Status Update</h2>
                                        <div style="background-color: ${statusInfo.color}; color: white; padding: 10px 20px; border-radius: 5px; margin: 20px 0;">
                                            <h3 style="margin: 0;">Status: ${order.status}</h3>
                                        </div>
                                        <p style="color: #666; line-height: 1.6;">${statusInfo.message}</p>
                                    </td>
                                </tr>

                                <!-- Order Details -->
                                <tr>
                                    <td style="padding: 0 30px;">
                                        <div style="border: 1px solid #eee; border-radius: 5px; padding: 20px;">
                                            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
                                            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id}</p>
                                            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                                            <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Items List -->
                                <tr>
                                    <td style="padding: 30px;">
                                        <table width="100%" style="border-collapse: collapse;">
                                            <tr style="background-color: #f8f9fa;">
                                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Qty</th>
                                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                                            </tr>
                                            ${order.items.map(item => `
                                                <tr>
                                                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${item.productId.title}</td>
                                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
                                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">$${item.price.toFixed(2)}</td>
                                                </tr>
                                            `).join('')}
                                        </table>
                                    </td>
                                </tr>

                                <!-- Shipping Address -->
                                <tr>
                                    <td style="padding: 0 30px 30px;">
                                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                                            <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
                                            <p style="margin: 5px 0;">${order.shippingAddress.street}</p>
                                            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                                            <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 10px 10px; text-align: center;">
                                        <p style="margin: 0; color: #666;">Thank you for shopping with BookNest!</p>
                                        <p style="margin: 10px 0 0; color: #666;">If you have any questions, please contact our support team.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return info;

    } catch (error) {
        console.error('Email sending error:', error.message);
        throw new Error('Failed to send order status update email');
    }
};