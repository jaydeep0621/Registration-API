const express = require("express");
const router = express.Router();
const bodyparser = require("body-parser");
const auth = require("../middleware/auth");
const controller = require("../controller/control");
const multer = require("multer");
const path = require("path");
router.use(bodyparser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/upload");
    },
    filename: function (req, file, cb) {
        cb(null, "Profile_Pic " + req.user.name + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({
    storage: storage,
})

router.get("/login", async (req, res) => {
    res.send("Work Excellent")
})

router.post("/register", controller.register)

router.post("/login", controller.login)

router.post("/update", auth.auth, controller.update);

router.post("/forgetpassword", controller.forgetpassword);

router.post("/getuser", auth.auth, controller.get);

router.post("/upload", auth.auth, upload.single('image'), controller.upload);

router.get("/logout/", auth.auth, controller.logout);

module.exports = router;