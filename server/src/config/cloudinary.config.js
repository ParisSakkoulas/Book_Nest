const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'BookNest',
    api_key: '816645494981941',
    api_secret: 'Bd80OHGweqn2mYSpPlGqo_-XxhY'
});

module.exports = cloudinary;

