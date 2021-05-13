const mongoose = require("mongoose");

const user1 = new mongoose.Schema(
    {
        email:{
            required: true,
            unique: true,
            type: String
        },
        name: {
            type: String,
            required: true,
        },
        phone:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true,
        },
        token:{
            type: String,
        }
    }
)
user1.static({
    getUserlist(reqObj, sort){
        return this.aggregate([{
            $match:{isDeleted: false}
        }])
    },
    existemail(email){
        return this.findOne({email: email});
    },
    existphone(phone){
        return this.findOne({phone:phone});
    },  
    updatetoken(id,token){
        return this.findOneAndUpdate({
            _id:mongoose.Types.ObjectId(id)
        },{
            $set: {
                token: token
            }
        })
    },

    updatepassword(id,password){
        return this.findOneAndUpdate({
            _id : mongoose.Types.ObjectId(id),
        },{
            $set:{
                password: password
            }
        })
    },

    updateID(reqObj){
        return this.findOneAndUpdate({
            _id:reqObj._id,
            isDeleted: false
        },{
            $set: reqObj
        })
    },

    requestdata(reqObj){
        return this.aggregate([{
            $match: {
                email: reqObj.email,
                isDeleted: false,
            }
        }])
    }
})

module.exports = mongoose.model("User", user1);