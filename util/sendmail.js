const { text } = require('express');
const nodemailer = require('nodemailer')
module.exports =async(email,subject)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              // TODO: replace `user` and `pass` values from <https://forwardemail.net>
              user: '',
              pass: ''
            }
        });
            // send mail with defined transport object
            const info = await transporter.sendMail({
              from: '"Shoping Cart 👻" <jafuj856@gmail.com>', // sender address
              to: email, // list of receivers
              subject: "Hello ✔", // Subject line
              text: "Hello world?", // plain text body
              html: "<b>Hello world?</b>", // html body
            });

        console.log('Email Send Successfully')
    } catch (error) {
        console.log('email verificatin failed')
        console.log(error)
    }
}