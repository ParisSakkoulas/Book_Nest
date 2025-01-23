const jwt = require('jsonwebtoken');

// Middleware to authenticate token
exports.requireAdmin = (req, res, next) => {


    try {


        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log(req.user)

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }


        next();



    } catch (err) {
        return res.status(403).json({ message: 'Authorization check failed' });
    }
};
