const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt=require('bcryptjs');

const userSchema= new Schema({
    email:{
        type:String,
        required:[true, "Email is required"],
        unique:true
    },
    password:{
        required:[true,"password is required"],
        type:String
    }
});

userSchema.pre("save",function(next){
    //encrypt password
    bcrypt.genSalt(10)
    .then(salt=>{
        bcrypt.hash(this.password,salt)
        .then(hash=>{
            this.password=hash;
            next();
        })
    })
})

const userModule = mongoose.model("user",userSchema);

module.exports=userModule;