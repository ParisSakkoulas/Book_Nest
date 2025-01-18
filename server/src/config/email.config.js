const nodemailer = require('nodemailer');

// Create transporter object to use for send verification code to the user
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'academicnetsp@gmail.com',
        pass: 'gleuzdlkvqwsiqgr'
    }
});

module.exports = transporter;

