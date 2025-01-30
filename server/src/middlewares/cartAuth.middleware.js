
const jwt = require('jsonwebtoken');



exports.cartAuthMiddleware = async (req, res, next) => {

    // Check for session ID first
    const sessionId = req.headers['x-session-id'];

    // If there's a session ID, treat as guest user
    if (sessionId) {
        req.user = null;
        next();
        return;
    }

    // Otherwise, try to authenticate token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    // If no token and no session ID, require at least a session ID
    if (!token) {
        return res.status(400).json({
            message: 'Either authentication token or session ID is required',
            required: 'x-session-id header for guest checkout or Bearer token for registered users'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED TOKEN", decoded)
        req.user = decoded;


        next();
    } catch (err) {
        return res.status(403).json({
            message: 'Invalid authentication token. Use session ID for guest checkout.',
            required: 'x-session-id header for guest checkout or valid Bearer token for registered users'
        });
    }


};