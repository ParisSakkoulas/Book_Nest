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
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center">
                            <table width="80%" cellpadding="0" cellspacing="0" style="background-color: #86CBFC;">
                                <tr>
                                    <td align="center" style="padding: 3%;">
                                        <h1 style="color: white; line-height: 160%;">BookNest</h1>
                                        <h1 style="color: white;">Hello</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="margin-top: 10%;">
                                        <h1 style="line-height: 150%; margin-bottom: 8%;">Please verify your email address</h1>
                                        <a href="http://localhost:4200/auth/login/verify/${verificationToken}" 
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