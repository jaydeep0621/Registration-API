const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const mongo = AppConfig.DB_URI; 

const option = {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

mongoose.connect(mongo, option)
.then(()=>{
    console.log(`DB Successfully Connected at Local Host : ${mongo}`);
}, (err)=>{
    console.log("Not Connected", err);
})