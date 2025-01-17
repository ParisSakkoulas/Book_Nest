const jwt = require('jsonwebtoken');

// Middleware to authenticate token
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded; // Add decoded user info to the request object
        next(); // Proceed to the next middleware/controller
    } catch (err) {
        return res.status(403).json({ message: 'Token is invalid' });
    }
};
