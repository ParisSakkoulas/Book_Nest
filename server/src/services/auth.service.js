const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const transporter = require('../config/email.config');


// Service: Register a new user
exports.registerUserService = async (email, password) => {
    try {


        // Input validation
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);


        // Generate verification token
        const verificationToken = jwt.sign({ data: 'Data token' }, process.env.JWT_SECRET, { expiresIn: '24h' });


        // Create new user
        const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            uniqueString: verificationToken,
            status: 'inactive'
        });

        // Save user
        await newUser.save();

        // Send verification email
        await sendVerificationEmail({
            email: newUser.email,
            verificationToken
        });

        // Return user without sensitive information
        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;

        return userResponse;

    } catch (error) {

        console.error('Registration error:', error);
        throw error;
    }
};


// Service: Send verification code 
exports.sendVerificationEmail = async ({ email, firstName, lastName, verificationToken }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Email Verification - BookNest',
            html: `
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <table width="80%" cellpadding="0" cellspacing="0" style="background-color: #86CBFC;">
                                <tr>
                                    <td align="center" style="padding: 3%;">
                                        <h1 style="color: white; line-height: 160%;">BookNest</h1>
                                        <h1 style="color: white;">Hello, ${firstName || ''} ${lastName || ''}</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="margin-top: 10%;">
                                        <h1 style="line-height: 150%; margin-bottom: 8%;">Please verify your email address</h1>
                                        <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}" 
                                           style="text-decoration: none; color: inherit; width: 30%; display: block; 
                                                  height: 50px; line-height: 50px; text-align: center; 
                                                  background-color: white; font-weight: 600; font-size: 20px; 
                                                  border-radius: 15px;">
                                            Verify Email
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 20px; padding: 20px;">
                                        <p>Thanks,</p>
                                        <p>BookNest Team</p>
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
        console.error('Email sending error:', error);
        throw new Error('Failed to send verification email');
    }
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

// Service: Verifyd email
exports.verifyEmailService = async (token) => {
    try {

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find and update user
        const user = await User.findOne({ uniqueString: token });

        if (!user) {
            throw new Error('Invalid or expired verification token');
        }

        // Update user verification status
        user.status = 'active';
        user.uniqueString = undefined; // Remove the token after verification
        await user.save();

        return user;

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid verification token');
        }
        if (error.name === 'TokenExpiredError') {
            throw new Error('Verification token has expired');
        }
        throw error;
    }
};
