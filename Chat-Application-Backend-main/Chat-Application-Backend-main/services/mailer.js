const nodemailer = require('nodemailer');
exports.ConfigMail=()=>{
    const config = {
        service : 'gmail',
        auth : {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        }
    }

    const transporter = nodemailer.createTransport(config);

   return transporter;
}



















