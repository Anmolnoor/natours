const nodeMailer = require('nodemailer');

const sendMail = async (options) => {
  //  creating the transporter with smtp server details and auth user and pass
  const transport = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  //   DEFINING THE EMAIL OPTIONS

  const mailOptions = {
    from: 'Anmol Noor <anmol@noor.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //  ACTUALLY SEND THE MAIL
  //   console.log('sending mail', options, transport); // eslint-disable-line
  try {
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
};

module.exports = sendMail;
