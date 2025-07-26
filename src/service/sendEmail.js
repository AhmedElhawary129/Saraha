import nodemailer  from "nodemailer";

export const sendEmail = async (to, subject, html, attachments) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: `"Saraha💬" <${process.env.EMAIL}>`,
        to: to ? to : `${process.env.TEST_EMAIL}`,
        subject: subject ? subject : "Hello",
        html: html ? html : "<b>Hello</b>", 
        attachments: attachments ? attachments : [],
    });
    if (info.accepted.length) {
        return true
    }
    return false
}