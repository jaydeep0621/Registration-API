const nodemailer = require("nodemailer");
const Appconfig = require("../config/config.json");

function sendMail(from, to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: Appconfig.SERVICE,
    auth: {
      user: Appconfig.email,
      pass: Appconfig.password,
    },
  });

  const mailoptions = {
    from,
    to,
    subject,
    text,
  }

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(info);
      }
    })
  })
}

function response(res, data, message, status, error) {
  const responsedata = {
    status,
    message,
    data: data,
    error: error || null,
  };
  res.status(status);
  res.format({
    json: () => {
      res.json(responsedata)
    }
  })
}

module.exports = {
  sendMail,
  response
};
