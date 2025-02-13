const User = require('../models/user.model');
const Customer = require('../models/customer.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const transporter = require('../config/email.config');
const { USER_STATUS } = require('../models/user.status.constants');
const { CUSTOMER_STATUS } = require('../models/customer.status.constants');

// Controller: Register a new user
exports.registerUser = async (req, res) => {
    try {


        //Get sign up data body
        const { email, password, firstName, lastName } = req.body;

        // Input validation
        if (!email && !password && !firstName && !lastName) {
            return res.status(400).json({
                message: "You are required to provide your Full name, an email and a password in order to register"
            })
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already in use"
            })
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
            status: USER_STATUS.PENDING_VERIFICATION
        });




        console.log(newUser)

        // Save user
        await newUser.save();

        // Send verification email
        await exports.sendVerificationEmail({
            email: newUser.email,
            verificationToken
        });


        // Return user without sensitive information
        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;


        //  Create new customer
        const customer = await Customer.create({
            user: userResponse._id,
            firstName,
            lastName,
            email,
            customerStatus: CUSTOMER_STATUS.REGISTERED
        });


        return res.status(200).json({
            message: `A confirmation email has been sent to ${userResponse.email}. Check your email!`,
            user: userResponse,
        });



    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Error creating customer',
            error: error.message
        });
    }
};

// Controller: Login user
exports.loginUser = async (req, res) => {

    try {

        //Get log in data body
        const { email, password } = req.body;
        console.log(req.body)


        //Check if email and password are in the body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required to log in"
            })
        }



        //Find user
        const userFound = await User.findOne({ email: email });


        //If user not exist
        if (!userFound) {
            return res.status(400).json({
                success: false,
                message: "User not found with this email"
            })
        }


        //Check password 
        const isPasswordValid = await bcrypt.compare(password, userFound.password);

        //If password incorrect
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication credentials'
            })
        }
        else {

            // If account is inactive
            if (userFound.status !== USER_STATUS.ACTIVE) {
                const statusMessages = {
                    PENDING_VERIFICATION: "Please verify your email address to activate your account",
                    AUTO_CREATED_UNVERIFIED: "This account was automatically created. Please check your email for verification instructions",
                    DEFAULT: "Account is not active. Please contact support if you need assistance"
                };

                return res.status(401).json({
                    success: false,
                    message: statusMessages[userFound.status] || statusMessages.DEFAULT
                });
            }



            //Generate token
            const token = jwt.sign({ userId: userFound._id, role: userFound.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

            //  userResponse object
            let userResponse = {
                user_id: userFound._id,
                email: userFound.email,
                role: userFound.role
            };


            if (userFound.role === 'USER') {
                const customerFound = await Customer.findOne({ user: userFound._id });
                if (customerFound) {
                    userResponse.firstName = customerFound.firstName;
                    userResponse.lastName = customerFound.lastName;
                }
            }

            res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                expiresIn: 3600,
                user: userResponse
            });



        }






    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
};


// Controller: Get user profile
exports.getUserProfile = async (req, res) => {

};

// Controller: Verify user account
exports.verifyUser = async (req, res) => {


    try {


        //Get JWT string from request 
        const uniqueString = req.params.confirmationCode;


        //Verify token
        const decodedToken = jwt.verify(uniqueString, process.env.JWT_SECRET)



        //Find the user
        const user = await User.findOne({ uniqueString: uniqueString });

        if (!user) {
            return res.status(201).json({
                message: 'Cant find user with this email'
            })
        }

        if (user.status === USER_STATUS.ACTIVE) {
            return res.status(201).json({
                message: 'User is already active. You can log in!'
            })
        }

        await User.findOneAndUpdate({ uniqueString: uniqueString }, { status: USER_STATUS.ACTIVE });


        //Success message
        res.status(201).json({
            type: 'Success',
            message: 'User email verified. You can now log in!'
        })










    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }

}

//Method for sending user verification code
exports.sendVerificationEmail = async ({ email, verificationToken }) => {

    console.log(email);
    console.log(verificationToken);


    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Email Verification - BookNest',
            html: `
               <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif;">
    <tr>
        <td align="center" style="padding: 40px 0; background-color: #f5f5f5;">
            <table width="600px" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header Section -->
                <tr>
                    <td align="center" style="padding: 40px 40px 20px; background-color: #1E88E5; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">BookNest</h1>
                        <p style="color: white; margin: 10px 0 0; font-size: 20px;">Hello!</p>
                    </td>
                </tr>

                <!-- Main Content Section -->
                <tr>
                    <td align="center" style="padding: 40px 40px 30px;">
                        <h2 style="color: #333; font-size: 24px; margin: 0 0 20px;">Please verify your email address</h2>
                        <p style="color: #666; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
                            To complete your registration and access all features of BookNest, please verify your email address.
                        </p>
                        <a href="https://e-book-nest.netlify.app/auth/login/verify/${verificationToken}" 
                           style="display: inline-block; padding: 15px 30px; background-color: #1E88E5; 
                                  color: white; text-decoration: none; font-weight: 600; font-size: 16px; 
                                  border-radius: 6px; transition: background-color 0.3s ease;">
                            Verify Email
                        </a>
                    </td>
                </tr>

                <!-- Footer Section -->
                <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                        <table width="100%">
                            <tr>
                                <td align="center" style="color: #666; font-size: 14px;">
                                    <p style="margin: 0 0 10px;">This link will expire in 24 hours.</p>
                                    <p style="margin: 0 0 10px;">If you didn't request this verification, please ignore this email.</p>
                                    <p style="margin: 0;">Thanks,<br/>BookNest Team</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <!-- Additional Info -->
            <table width="600px" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding: 20px 0; color: #666; font-size: 12px;">
                        <p style="margin: 0;">Need help? Contact us at academicnetsp@gmail.com</p>
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
        throw new Error('Failed to send verification email');
    }
};


// Method for creating an admin when setting up the application
exports.setupInitialAdmin = async () => {
    try {
        // Check if any admin exists
        const adminExists = await User.findOne({ role: 'ADMIN' });

        if (adminExists) {
            console.log('Admin already exists. Skipping initial admin setup.');
            return;
        }

        // Generate verification token
        const verificationToken = jwt.sign({ data: 'Data token' }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Create first admin with environment variables
        const adminData = {
            email: process.env.INITIAL_ADMIN_EMAIL,
            password: await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD, 12),
            role: 'ADMIN',
            status: USER_STATUS.ACTIVE,
            uniqueString: verificationToken,
            firstName: process.env.INITIAL_ADMIN_FIRSTNAME,
            lastName: process.env.INITIAL_ADMIN_LASTNAME
        };

        const admin = await User.create(adminData);
        console.log('Initial admin account created successfully');

    } catch (error) {
        console.error('Error creating initial admin:', error);
    }
};

// Controller: resent email verification
exports.resentVerificationEmail = async (req, res) => {

    try {



        const customerToChange = await Customer.findById(req.params.customerId);
        if (!customerToChange) {
            return res.status(201).json({
                message: 'Cant find customer'
            })
        }

        const userToSendLink = await User.findById(customerToChange.user);
        if (!userToSendLink) {
            return res.status(201).json({
                message: 'Not email connected to that user'
            })
        }

        // Generate verification token
        const verificationToken = jwt.sign({ data: 'Data token' }, process.env.JWT_SECRET, { expiresIn: '24h' });

        const updatedUser = await User.findByIdAndUpdate(userToSendLink._id, { uniqueString: verificationToken })

        console.log(userToSendLink)

        await exports.sendVerificationEmail({
            email: userToSendLink.email,
            verificationToken
        });

        return res.status(200).json({
            message: `A confirmation email has been sent to ${userToSendLink.email}. Inform the user!`
        });

    } catch (err) {

    }

}

// Controller: change user status
exports.userStatusUpdate = async (req, res) => {

    try {


        //Find the user
        const customerFound = await Customer.findById(req.params.customerId);
        if (!customerFound) {
            return res.status(400).json({
                message: "Customer not found"
            })
        }


        //Get and check the status on body
        const { newStatus } = req.body;
        if (!Object.values(USER_STATUS).includes(newStatus)) {
            return res.status(400).json({
                message: "Invalid status provided"
            })
        }

        //Update user to a specific status type
        const updatedUser = await User.findByIdAndUpdate(customerFound.user, { status: newStatus }, { new: true });

        // If user not found
        if (!updatedUser) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: `User status changed to ${newStatus} successfully`,
            user: updatedUser,
            status: updatedUser.status
        });


    } catch (err) {

        console.log(err)
        return res.status(400).json({

            message: "Error on activating user"
        })
    }

}

// Controller: check email already in use
exports.checkEmailInUse = async (req, res, next) => {


    try {



        const { email, currentUserId } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if email exists but exclude current user
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim(),
            _id: { $ne: currentUserId } // Exclude current user
        });

        return res.status(200).json({
            success: true,
            exists: !!existingUser,
            message: existingUser ? 'Email already exists' : 'Email is available'
        });


    } catch (err) {
        return res.status(400).json({
            message: "Error on fetching user"
        })
    }


}

// Controller: update user email
exports.updateEmail = async (req, res) => {
    try {
        const { userId, email } = req.body;

        // Validate email format
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !re.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email is already in use
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        // Update user email
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { email: email.toLowerCase() },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            message: 'Email updated successfully',
            user: {
                email: updatedUser.email
            }
        });
    } catch (error) {
        console.error('Update email error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller: update user password
exports.updatePassword = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Validate password strength
        if (!password) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};