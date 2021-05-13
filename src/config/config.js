const dotenv = require("dotenv");

require("dotenv").config();

module.exports = config = {
    PORT : process.env.PORT,
    DB_URI : process.env.DB_URI,
    JWTSECRET : process.env.JWTSECRET
}

global.AppConfig = config;