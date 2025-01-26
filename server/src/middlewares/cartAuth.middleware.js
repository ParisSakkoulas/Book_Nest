



exports.cartAuthMiddleware = async (req, res, next) => {


    if (req.user) {
        req.cartIdentifier = { userId: req.user.userId };
    }
    // Check for visitor session
    else if (req.headers['x-session-id']) {
        req.cartIdentifier = { sessionId: req.headers['x-session-id'] };
    }
    else {
        return res.status(400).send({ error: 'Either authentication or session ID required' });
    }
    next();



};