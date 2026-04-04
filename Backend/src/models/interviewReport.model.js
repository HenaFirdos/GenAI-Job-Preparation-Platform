const mongoose = require('mongoose');

/**
 * - job description schema :String
 * - resume text : String
 * - Self description : String
 *
 * - matchScore : Number
 *
 * - Technical questions :
 *      [{
 *          question : "",
 *          intention : "",
 *          answer : "",
 *      }]
 *
 * - Behavioral questions : [
 *      {
 *          question : "",
 *          intention : "",
 *          answer : "",
 *      }
 * ]
 *
 * - Skill gaps : [{
 *      skill : "",
 *      severity : {
 *          type : String,
 *          enum : ["low", "medium", "high"]
 *      }
 * }]
 *
 * - plan length (days) : Number
 * - preparation plan : [{
 *      day : Number,
 *      focus : String,
 *      tasks : [String]
 * }]
 */

const technicalQuestionSchema=new mongoose.Schema ({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intension:{
        type:String,
        required:[true,"Technical question is required"]
    },
    answer:{
        type:String,
        required:[true,"Technical question is required"]
    }
},{
    _id: false
})
const behavioralQuestionSchema=new mongoose.Schema ({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intension:{
        type:String,
        required:[true,"Technical question is required"]
    },
    answer:{
        type:String,
        required:[true,"Technical question is required"]
    }
},{
    _id: false
})
const skillGapSchema=new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"skill is required"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"severity is required"]
    }
    },{
        _id:false
})

const preprationPlanSchema =new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Day is reuired"]
    },
    focus:{
        type:String,
        required:[true,"Focus is required"]
    },
    tasks:[{
        type:String,
        required:[true,"Task is required"]
    }]
})
const interViewReportSchema =new mongoose.Schema({
    jobDescription :{
        type:String,
        required:[true,"job description is required"]
    },
    resume:{
        type:String,
    },
    selfDescription:{
        type:String,
    },
    matchScore:{
        type:Number,
        min:0,
        max:100,
    },
    planDays:{
        type:Number,
        min:1,
        max:14,
        default:5,
    },
    title:{
        type:String,
        required:[true,"Job title is required"]
    },
    technicalQuestion:[technicalQuestionSchema],
    behavioralQuestion:[behavioralQuestionSchema],
    skillGaps:[skillGapSchema],
    preprationPlan:[preprationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }
},{
    timestamps:true
})
const interviewReportModel=mongoose.model("InterviewReport",interViewReportSchema)
module.exports=interviewReportModel;
