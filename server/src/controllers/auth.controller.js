const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const transporter = require('../config/email.config');

// Controller: Register a new user
exports.registerUser = async (req, res) => {
    try {


        //Get sign up data body
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required to sign up"
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
            status: 'inactive'
        });

        console.log(newUser)

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


        return res.status(200).json({
            message: `A confirmation email has been sent to ${userResponse.email}. Check your email!`,
            user: userResponse,
        });



    } catch (error) {

        res.status(400).json({
            message: error.message
        });
    }
};

// Controller: Login user
exports.loginUser = async (req, res) => {
    try {

        //Get log in data body
        const { email, password } = req.body;


        //Check if email and password are in the body
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required to log in"
            })
        }



        //Find user
        const userFound = await User.findOne({ email: email });

        //If user not exist
        if (!userFound) {
            return res.status(400).json({
                message: "User not found with this email"
            })
        }


        //Check password 
        const isPasswordValid = await bcrypt.compare(password, userFound.password);

        //If password incorrect
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid authentication credentials'
            })
        }
        else {

            //If account is inactive
            if (userFound.status === 'inactive') {
                return res.status(401).json({
                    message: "Pending Account. Please Verify Your Email!",
                })
            }

            //Generate token
            const token = jwt.sign({ userId: userFound._id }, process.env.JWT_SECRET, { expiresIn: '1h' });



            //Sent data to client
            res.status(200).json({
                message: 'Auth success',
                token: token,
                expiresIn: 3600,
            })



        }






    } catch (error) {
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

        await User.findOneAndUpdate({ uniqueString: uniqueString }, { status: 'active' });


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
sendVerificationEmail = async ({ email, verificationToken }) => {

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