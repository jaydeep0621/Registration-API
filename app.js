const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const bodyparser = require("body-parser");
const morgan = require("morgan");
const async = require("async");
const i18n = require("i18n");
const cors = require("cors");
const path = require("path");
const httpStatus = require("./src/exception/httpstatus.json");
const utility = require("./src/utility/util");
const cookieparser = require("cookie-parser");
const routes = require("./src/routes/route");
const config = require("./src/config/config");
require("./src/config/db");
const logger = require("./src/config/logger");

const app = express();
const port = AppConfig.PORT;

app.use(morgan("dev"));

i18n.configure({
  locales: "en",
  directory: __dirname + "/src/locales",
  updateFiles: false,
  objectNotation: true
});

app.use(function (req, res, next) {
  i18n.init(req, res);
  next();
});

// secure apps by setting various HTTP headers
app.use(helmet());

// parse body params and attache them to req.body
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser());

//Crros Origin Resource Sharing
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//main route calling
app.use("/", routes);

app.get("/sign", function (req, res) {
  res.send("Successfully Done");
})

//express.static to hold to serve static files such as Images, CSS files, and JavaScript files
app.use("/static", express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
  const err = {
    message: "404 Not found",
    status: httpStatus.NOT_FOUND
  }
  next(err);
});

//initialize next
app.use((err, req, res, next) => {
  if (AppConfig.ENV != "production") {
    console.error("Error is::", err); 
  }
  logger.log({
    level: 'error',
    requestURL: req['_parsedUrl']['_raw'],
    message: err.message || err.resMsg
  });
  return utility.response(
    res,
    {},
    err.resMsg,
    err.status || httpStatus.INTERNAL_SERVER_ERROR,
    err.resCode || i18n.__("responseStatus.FAIL"),
    {
      msg: err.message || err.resMsg
    },
  );
})

app.listen(port, () => {
  console.log(`Successfully Connected at Port : ${port}`);
})

module.exports = app;




