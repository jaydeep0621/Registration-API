const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const SessionSchema = new mongoose.Schema({
    userId:[{ type:mongoose.Schema.ObjectId, ref: 'User'}],
    token:{
        type: String,
    },
    islogin:{type:Boolean, default:false},
},{timestamp:true});

SessionSchema.method({
    savesession(){
        return this.save;
    },
});

SessionSchema.static({
    
    removesession(sessionObj){
        return this.updateMany(sessionObj, { $set: { isLogin: 0 } }, { multi: true })
    },

    checkSession(reqObj){
        return this.find({
            userId: ObjectId(reqObj.userId),
            isLogin:1
        })
    }
})

//"Session" => Tell about name of collection in Mongo DB Databases
module.exports = mongoose.model('Session', SessionSchema);