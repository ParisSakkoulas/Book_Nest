// costumer routes
const express = require('express');
const { createCustomer, getCustomers, getSingleCustomer, deleteCustomer, updateCustomer } = require('../controllers/customer.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

const router = express.Router();

// Route: create new customer
router.post('/create', authenticateToken, requireAdmin, createCustomer);


// Route: get customers
router.get('/all', authenticateToken, requireAdmin, getCustomers);


// Route: get single customer
router.get('/:customerId', authenticateToken, requireAdmin, getSingleCustomer);


// Route: delete single customer
router.delete('/:customerId', authenticateToken, requireAdmin, deleteCustomer);


// Route: update customer
router.put('/:customerId', authenticateToken, updateCustomer);



module.exports = router;