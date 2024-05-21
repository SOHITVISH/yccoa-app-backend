import nodemailer from "nodemailer";
import { log } from "../../index.js"
import hbs from "nodemailer-express-handlebars"

let FILENAME = `email.js`
let PATH = `controllers/sendMail/email.js`

const MailSendCustomer = (sendingmail) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const handlebaroption = {
        viewEngine: {
            partialsDir: "./view/partials",
            layoutsDir: "./view/layouts",
        },
        viewPath: "view"
    };

    transporter.use("compile", hbs(handlebaroption));
    transporter.use('compile', hbs({
        viewEngine: 'express-handlebars',
        viewPath: "./view"
    }))

    transporter.sendMail(sendingmail, function (error, info) {
        if (error) {
            console.log(error);
            log.error(`Something went wrong ${error}  FileName-${FILENAME} - Path-${PATH}`)
        } else {
            log.info(`Email send successfully-  FileName-${FILENAME} - Path-${PATH}`)
            console.log('Email sent: ' + info.response);
        }
    });
    

}
export default MailSendCustomer
