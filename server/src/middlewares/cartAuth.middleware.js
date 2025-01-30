
const jwt = require('jsonwebtoken');



exports.cartAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const sessionId = req.headers['x-session-id'];
    const token = authHeader && authHeader.split(' ')[1];

    //User has a valid token
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (err) {
            // Token is invalid, but we'll check for session ID before failing
            if (!sessionId) {
                return res.status(403).json({
                    message: 'Invalid authentication token.',
                    required: 'Valid Bearer token or x-session-id header required'
                });
            }
        }
    }

    //User has a session ID
    if (sessionId) {
        req.user = null;
        req.sessionId = sessionId;
        return next();
    }


    return res.status(401).json({
        message: 'Authentication required',
        required: 'Please provide either a Bearer token or x-session-id header'
    });
};