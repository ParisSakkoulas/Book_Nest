const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Service: Register a new user
exports.registerUserService = async (email, password) => {


    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);



    // Create and save the user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return newUser;
};


// Service: Login user
exports.loginUserService = async (email, password) => {

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { user, token };
};



// Service: Get user profile
exports.getUserProfileService = async (userId) => {
    // Find the user by ID and exclude the password
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }

    return user;
};
