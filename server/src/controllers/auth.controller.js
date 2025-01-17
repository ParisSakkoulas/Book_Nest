const {
    registerUserService,
    loginUserService,
    getUserProfileService,
} = require('../services/auth.service');



// Controller: Register a new user
exports.registerUser = async (req, res) => {
    try {

        //Get sign up data body
        const { email, password } = req.body;

        //Call register user service method
        const newUser = await registerUserService(email, password);

        //Return success message
        res.status(201).json({ message: 'User registered successfully', user: newUser });

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

        //Call login user service method
        const { user, token } = await loginUserService(email, password);

        //Return success message
        res.status(200).json({ message: 'Login successful', user, token });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Controller: Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await getUserProfileService(userId);
        res.status(200).json({ user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
