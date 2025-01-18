import nodemailer from "nodemailer";



const SendEmail = async function (email, subject, message) {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_POST,
        secure: true,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: subject,
        html: message
    })
}
 

export default SendEmail;