const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./auth.controller');
const Customer = require('../models/customer.model');
const mongoose = require('mongoose');
const { USER_STATUS } = require('../models/user.status.constants');
const { CUSTOMER_STATUS } = require('../models/customer.status.constants');

// Controller: Create new costumer
exports.createCustomer = async (req, res) => {


    try {

        const { email, firstName, lastName, phoneNumber, address } = req.body;


        // First, check phone number uniqueness regardless of email
        if (phoneNumber) {
            const phoneExists = await Customer.findOne({ phoneNumber });
            if (phoneExists) {
                return res.status(400).json({
                    success: false,
                    message: 'A customer with this phone number already exists',
                    existingCustomerDetails: {
                        customerId: phoneExists._id,
                        customerStatus: phoneExists.customerStatus,
                        // Don't include sensitive information
                    }
                });
            }
        }

        // Now proceed with customer creation based on whether email exists
        if (!email) {
            // Create unregistered customer
            const customer = await Customer.create({
                firstName,
                lastName,
                phoneNumber,
                address,
                customerStatus: CUSTOMER_STATUS.UNREGISTERED
            });

            return res.status(201).json({
                success: true,
                data: {
                    customer,
                    message: 'Customer created without an email connected'
                }
            });
        }

        // Check if user exists with this email
        let user = await User.findOne({ email: email.toLowerCase() });

        // If user exists, check if they already have a customer profile
        if (user) {
            const existingCustomer = await Customer.findOne({ user: user._id });
            if (existingCustomer) {
                return res.status(400).json({
                    success: false,
                    message: 'A customer profile already exists for this email'
                });
            }
        } else {
            // Create new user if they don't exist
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            const verificationToken = jwt.sign({ data: 'Data token' }, process.env.JWT_SECRET, { expiresIn: '24h' });

            user = await User.create({
                email: email.toLowerCase(),
                password: hashedPassword,
                uniqueString: verificationToken,
                role: 'CUSTOMER',
                status: USER_STATUS.AUTO_CREATED_UNVERIFIED
            });

            // Send verification email
            await sendVerificationEmail({
                email: user.email,
                verificationToken
            });
        }

        // Create new customer with the user reference
        const customer = await Customer.create({
            user: user._id,
            firstName,
            lastName,
            email: email.toLowerCase(),
            phoneNumber,
            address,
            customerStatus: CUSTOMER_STATUS.REGISTERED
        });

        return res.status(201).json({
            success: true,
            data: {
                customer,
                userCreated: !user,
                message: user ? 'Customer created with existing user account' :
                    'Customer created with new user account. Check email for login details.'
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }


}

// Controller: Get all costumers
exports.getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { email, phone, firstName, lastName, searchText, customerStatus, isActive } = req.query;

        let searchQuery = {};

        // Handle email search
        if (email) {

            const users = await User.find({
                email: { $regex: email, $options: 'i' }
            }).select('_id');

            const userIds = users.map(user => user._id);
            searchQuery.user = { $in: userIds };
        }

        // Handle phone search
        else if (phone) {
            searchQuery.phoneNumber = { $regex: phone, $options: 'i' };
        }

        // Handle first name and last name search
        else if (firstName && lastName) {
            searchQuery.$and = [
                { firstName: { $regex: firstName, $options: 'i' } },
                { lastName: { $regex: lastName, $options: 'i' } }
            ];
        }

        // Handle general search text
        else if (searchText) {

            const users = await User.find({
                email: { $regex: searchText, $options: 'i' }
            }).select('_id');

            const userIds = users.map(user => user._id);

            searchQuery.$or = [
                { firstName: { $regex: searchText, $options: 'i' } },
                { lastName: { $regex: searchText, $options: 'i' } },
                { phoneNumber: { $regex: searchText, $options: 'i' } },
                { user: { $in: userIds } }
            ];
        }

        // Add customerStatus filter if provided
        if (customerStatus) {
            searchQuery.customerStatus = customerStatus;
        }

        // Add isActive filter if provided
        if (isActive !== undefined) {
            searchQuery.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Customer.countDocuments(searchQuery);

        // Get customers with pagination and populate user fields
        const customers = await Customer.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'user',
                select: '_id email role status uniqueString createdAt updatedAt'
            });


        return res.status(200).json({
            success: true,
            data: {
                customers: customers.map(customer => ({
                    _id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phoneNumber: customer.phoneNumber,
                    address: customer.address,
                    customerStatus: customer.customerStatus,
                    isActive: customer.isActive,
                    createdAt: customer.createdAt,
                    updatedAt: customer.updatedAt,
                    user: customer.user ? {
                        _id: customer.user._id,
                        email: customer.user.email,
                        role: customer.user.role,
                        status: customer.user.status,
                        uniqueString: customer.user.uniqueString,
                        createdAt: customer.user.createdAt,
                        updatedAt: customer.user.updatedAt
                    } : null
                })),
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            }
        });

    } catch (err) {
        console.error('Error in getCustomers:', err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Controller: Get single costumer
exports.getSingleCustomer = async (req, res) => {

    try {


        const customerId = req.params.customerId;
        const customerFound = await Customer.findById(customerId).populate('user', '-password -uniqueString');;

        if (!customerFound) {
            return res.status(400).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            Customer: customerFound,
            message: 'Customer found'
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }

}

// Controller: Get single costumer based on user data
exports.getCustomerFromUser = async (req, res) => {

    try {

        const customer = await Customer.findOne({ user: req.params.userId });

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: 'Customer not found'
            });
        }

        console.log(customer)

        if (customer.address) {

            const customerInfo = {
                firstName: customer.firstName,
                lastName: customer.lastName,
                _id: customer._id,
                phoneNumber: customer.phoneNumber,
                street: customer.address.street,
                city: customer.address.city,
                state: customer.address.state,
                zipCode: customer.address.zipCode,
                country: customer.address.country,
            }


            return res.status(200).json({
                success: true,
                message: 'Customer Found',
                customerInfo: customerInfo,

            });

        }




    } catch (err) {
        console.log(err)
        return res.status(400).json({
            success: false,
            message: 'Failed to get customer'
        });
    }

}

// Controller: Delete single costumer
exports.deleteCustomer = async (req, res) => {

    const customerToDeleteId = req.params.customerId;

    //If id of customer to delete exists
    if (customerToDeleteId) {

        try {


            // Delete customer with this id
            const customerToDelete = await Customer.findById(customerToDeleteId).populate('user');

            // If customer not found
            if (!customerToDelete) {
                return res.status(404).json({ message: "Customer not found" });
            }

            if (customerToDelete.user) {
                const deletedUser = await User.findByIdAndDelete(customerToDelete.user._id);
                const deletedCustomer = await Customer.findByIdAndDelete(customerToDeleteId);

                // If customer deleted
                return res.json({
                    message: "Customer deleted successfully. User connected to the accoutn also deleted",
                    deletedUser: deletedUser,
                    deletedCustomer: deletedCustomer,

                });
            }


            const deletedCustomer = await Customer.findByIdAndDelete(customerToDeleteId);
            // If customer deleted
            return res.json({
                message: "Customer deleted successfully",
                Customer: deletedCustomer
            });



            // Response
        } catch (error) {
            return res.status(500).json({ message: "Error deleting user", error: error.message });
        }



    }

}

// Controller: Update single costumer
exports.updateCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const {
            email,
            firstName,
            lastName,
            phoneNumber,
            address,
            customerStatus,
            isActive
        } = req.body;



        // Find existing customer
        const existingCustomer = await Customer.findById(customerId).populate('user');
        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Initialize update operators
        const updateData = {
            $set: {},
            $unset: {}
        };

        // Handle email update scenarios
        if (email) {
            const normalizedEmail = email.toLowerCase();

            if (existingCustomer.user) {
                if (normalizedEmail !== existingCustomer.user.email) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot update to a different email for registered customer. Email updates must be handled through user account management.'
                    });
                }
                updateData.$set.email = normalizedEmail;
            } else if (existingCustomer.customerStatus === CUSTOMER_STATUS.UNREGISTERED) {
                let user = await User.findOne({ email: normalizedEmail });

                if (user) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already associated with another account'
                    });
                }

                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 12);
                const verificationToken = jwt.sign({ data: 'Data token' }, process.env.JWT_SECRET, { expiresIn: '24h' });

                user = await User.create({
                    email: normalizedEmail,
                    password: hashedPassword,
                    uniqueString: verificationToken,
                    role: 'CUSTOMER',
                    status: CUSTOMER_STATUS.AUTO_CREATED_UNVERIFIED
                });

                await sendVerificationEmail({
                    email: user.email,
                    verificationToken
                });

                updateData.$set.user = user._id;
                updateData.$set.customerStatus = CUSTOMER_STATUS.REGISTERED;
                updateData.$set.email = normalizedEmail;
            }
        }

        // Handle basic fields
        if (firstName) updateData.$set.firstName = firstName.trim();
        if (lastName) updateData.$set.lastName = lastName.trim();

        // Handle phone number
        if (phoneNumber && phoneNumber !== existingCustomer.phoneNumber) {
            const phoneExists = await Customer.findOne({
                phoneNumber,
                _id: { $ne: customerId }
            });

            if (phoneExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists for another customer'
                });
            }
            updateData.$set.phoneNumber = phoneNumber;
        }

        // Handle address fields
        if (address) {
            for (const field of ['street', 'city', 'state', 'zipCode', 'country']) {
                if (field in address) {
                    if (address[field] === null || address[field] === undefined) {
                        updateData.$unset[`address.${field}`] = "";
                    } else {
                        updateData.$set[`address.${field}`] = address[field];
                    }
                }
            }
        }

        // Handle customer status
        if (customerStatus) {
            if (![CUSTOMER_STATUS.REGISTERED, CUSTOMER_STATUS.UNREGISTERED].includes(customerStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid customer status'
                });
            }

            if (customerStatus === CUSTOMER_STATUS.REGISTERED && !existingCustomer.user) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot set status to REGISTERED without associated user'
                });
            }

            updateData.$set.customerStatus = customerStatus;
        }

        // Handle isActive
        if (typeof isActive === 'boolean') {
            updateData.$set.isActive = isActive;
        }

        // Remove empty operators
        if (!Object.keys(updateData.$set).length) delete updateData.$set;
        if (!Object.keys(updateData.$unset).length) delete updateData.$unset;

        // Perform update
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('user', '-password -uniqueString');

        let responseMessage = 'Customer updated successfully';
        if (email && !existingCustomer.user) {
            responseMessage = 'Customer updated and registered. Verification email sent.';
        }

        return res.status(200).json({
            success: true,
            message: responseMessage,
            data: {
                customer: updatedCustomer
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Error updating customer'
        });
    }
};
