const i18n = require("i18n");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const async = require("async");
const moment = require("moment");
const user1 = require("../model/user");
const Appconfig = require("../config/config.json");
const Session = require("../model/session");
const httpStatus = require("../exception/httpstatus.json");
const utility = require("../utility/send");

module.exports = {

  passwordhash: async (password) => {
    let pass = bcrypt.hashSync(password, Number(Appconfig.SALT.ROUND));
    return pass;
  },

  register: async (req, res, next) => {
    try {
      const User1 = new user1(req.body);
      const getuseremailresponse = await user1.existemail(User1.email);
      const getuserphoneresponse = await user1.existphone(User1.phone);
      if (getuseremailresponse) {
        const err = {};
        err.Status = httpStatus.CONFLICT;
        err.resMsg = i18n.__("EMAIL_ALREADY_EXIST");
        err.resCode = i18n.__("responseStatus.ERROR");
        return next(err);
      }
      if (getuserphoneresponse) {
        const err = {};
        err.Status = httpStatus.CONFLICT;
        err.resMsg = i18n.__("PHONE_ALREADY_EXIST")
        err.resCode = i18n.__("responsestatus.ERROR")
        return next(err);
      }
      User1.password = await module.exports.passwordhash(User1.password);
      let registeruser = await User1.save();
      registeruser = registeruser.toObject();
      delete registeruser["password"];

      //JWT Authentication
      let token = jwt.sign({
        id: registeruser["_id"],
        email: registeruser["email"],
        name: registeruser["name"],
      }, AppConfig.JWTSECRET);

      registeruser["token"] = token;

      //express-session matching
      const sessionObj = new Session();
      sessionObj.userId = registeruser._id;
      sessionObj.isLogin = true;
      sessionObj.token = token;
      await sessionObj.save();

      utility.response(res,
        registeruser,
        i18n.__("USER_REGISTERED"),
        httpStatus.OK,
        i18n.__("responsestatus.SUCCESS")
      )
    }
    catch (err) {
      console.log(err);
      err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.ERROR");
      return next(err);
    }
  },

  //Login
  login: async (req, res, next) => {
    try {
      const data = new user1(req.body);
      data.email = req.body.email.trim();
      user1.findOne({ email: data.email.trim() }, async (err, user1) => {
        if (err) {
          const err = {};
          err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
          err.resCode = i18n.__("responsestatus.ERROR");
          return next(err);
        }
        if (!user1) {
          const err = {};
          err.resMsg = i18n.__("USER_NOT_EXIST");
          err.resCode = i18n.__("responsestatus.ERROR");
          return next(err);
        }
        bcrypt.compare(data.password, user1.password, async (err, compare) => {
          if (!compare) {
            const err = {};
            err.resMsg = i18n.__("WRONG_PASSWORD");
            err.resCode = i18n.__("responsestatus.ERROR");
            const time = moment().format("HH:mm A, MMMM-do-YYYY, dddd");
            const name = user1["name"];
            const send = await utility.sendMail(
              AppConfig.email,
              user1.email,
              "Login Details",
              `Hello ${name} Somebody Tries to Login at your profile at ${time}`);
            return next(err);
          }
          try {
            const userSession = {
              userId: user1._id.toString()
            }
            const checkLogin = await Session.checkSession(userSession);
            if (checkLogin.length) {
              await Session.removeSession({ userId: user._id });
            }
            let token = jwt.sign({
              id: user1["_id"],
              email: user1["email"],
              name: user1["name"],
            }, AppConfig.JWTSECRET);

            user1 = user1.toObject();
            user1["token"] = token;
            const sessionObj = new Session();
            sessionObj.userId = user1._id;
            sessionObj.token = token;
            sessionObj.isLogin = true;
            const sessionResponse = sessionObj.save();
            const time = moment().format("HH:mm A, MMMM-do-YYYY, dddd");
            const name = user1["name"];
            const send = await utility.sendMail(
              AppConfig.email,
              user1.email,
              "Login Details",
              `Hello ${name} You Successfully Login at IBM Website at ${time}`);
            //res.json(user1);
            res.send("User Successfully Login");
          }
          catch (err) {
            console.log(err);
            err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
            err.resCode = i18n.__("responsestatus.ERROR")
            return next(err);
          }
        })
      })
    }
    catch (err) {
      console.log(err);
      err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.ERROR");
      return next(err);
    }
  },

  //Update Password
  update: async (req, res, next) => {
    try {
      const oldpassword = req.body.oldpassword;
      const newpassword = req.body.newpassword;
      const getresponse = await user1.updateID(req.user.id);
      const data = user1.findOne({ email: req.user.email }, async (err, User1) => {
        if (oldpassword === newpassword) {
          const err = {};
          err.resMsg = i18n.__("OLD_PASSWORD_CANNOT_BE_WITH_NEW_PASSWORD");
          err.resCode = i18n.__("responsestatus.ERROR");
          return next(err);
        }
        const oldcheck = User1["password"];
        bcrypt.compare(oldpassword, oldcheck), async (err, compare) => {
          if (!compare) {
            const err = {};
            err.resMsg = i18n.__("OLD_PASSWORD_DOES_NOT_MATCH");
            err.resCode = i18n.__("responsestatus.ERROR");
            return next(err);
          }
        };
        const password = await module.exports.passwordhash(newpassword);
        User1["password"] = await user1.updatepassword(User1["_id"], password);
        const name = User1["name"];
        const time = moment().format("HH:mm A, MMMM-do-YYYY, dddd");
        const send = await utility.sendMail(
          AppConfig.email,
          User1["email"],
          "Password Successfully Changed",
          `Hello ${name}, Your Password Has Been Successfully Changed at ${time}`)
        res.send("Password Updated Successfully");
        //console.log("---send",send);
      })
    } catch (err) {
      console.log(err);
      err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.ERROR");
      return next(err);
    }
  },

  //forget password
  forgetpassword: async (req, res, next) => {
    try {
      const reqObj = {
        email: req.body.email,
      }

      const User1 = await user1.findOne({ email: reqObj.email }, async (err, User1) => {
        if (!User1) {
          const err = {};
          err.resMsg = i18n.__("USER_NOT_EXIST");
          err.resCode = i18n.__("responsestatus.FAILURE");
          return next(err);
        }

        const random = (Math.random() * Math.pow(36, 6) | 0).toString(36);

        const send = await utility.sendMail(
          AppConfig.email,
          reqObj.email,
          "NEW Password is",
          `Here is Your New Password : ${random}`
        )

        if (!send) {
          const err = {};
          err.resMsg = i18n.__("UNABLE_TO_SEND_EMAIL");
          err.resCode = i18n.__("responsestatus.FAILURE");
          return next(err);
        }
        const password = await module.exports.passwordhash(random);
        console.log(password);

        User1["password"] = await user1.updatepassword(User1["_id"], password);
        console.log("--User", User1["password"]);

        if (!User1["password"]) {
          const err = {};
          err.resMsg = i18n.__("UNABLE_TO_RETRIEVE_PASSWORD");
          err.resCode = i18n.__("responsestatus.FAILURE");
          return next(err);
        }
        res.send("PASSWORD HAS BEEN SUCCESSFULLY RECOVERED");
      })
    }
    catch (err) {
      err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.ERROR");
      console.log(err);
      return next(err);
    }

  },

  //get user
  get: async (req, res, next) => {
    try {
      const getuser = user1.findOne({ email: req.user.email }, async (err, User1) => {
        if (err) {
          err.resMsg = i18n.__("USER_DOESNOT_EXIST");
          err.resCode = i18n.__("responsestatus.ERROR");
          return next(err);
        }
        else {
          res.send("User Retrieve Successfully");
          console.log("--User", User1);
        }
      })
    } catch (err) {
      console.log(err);
      err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.FAILURE");
      return next(err);
    }
  },

  //upload File
  upload: async (req, res, next) => {
    try {
      if (!req.file) {
        const err = {};
        err.resMsg = i18n.__("THERE_IS_NO_FILE_ATTATCH");
        err.resCode = i18n.__("responsestatus.ERROR");
        return next(err);
      }
      res.send("File Uploaded Successfully");
    }
    catch (err) {
      console.log(err);
      err.resMsg = i18n.__("SOMETHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.ERROR");
      return next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      const userid = req.user.id;
      const removesession = await Session.removesession({ userId: userid });

      if (removesession.nModified < 0) {
        res.send("USER Not Exist");
      }
      res.send("USER LOGOUT SUCCESSFULLY");
    } catch (err) {
      console.log(err);
      err.resMsg = i18n.__("SOMETHHING_WENT_WRONG");
      err.resCode = i18n.__("responsestatus.ERROR");
      return next(err);
    }
  }
}