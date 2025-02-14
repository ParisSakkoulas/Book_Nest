// routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const customerRoutes = require('./customer.routes');
const bookRoutes = require('./products.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');



/*
const customerRoutes = require('./customer.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
*/

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/books', bookRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);




/*
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
*/

module.exports = router;
