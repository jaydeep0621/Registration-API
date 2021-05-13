const jwt = require("jsonwebtoken");
const i18n = require("i18n");

module.exports = {
    
    async auth(req, res, next) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, AppConfig.JWTSECRET); 
            req.user = decoded;
            next();
        }
        catch(err){
            console.log(err);
            err.resMsg = i18n.__("UNAUTHORIZED_USER");
            err.rescode = i18n.__("responsestatus.ERROR");
            return next(err);
        }
    }
}