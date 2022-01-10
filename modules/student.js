const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema= new Schema({
  
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    numberOfCourse:{
        type:Number,
        required:true
    },
    profilePic:{
        type:String
    }

})

const studentModule = mongoose.model("student",StudentSchema);
module.exports=studentModule;