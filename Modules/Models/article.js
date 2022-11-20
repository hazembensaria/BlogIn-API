const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const articleSchema=mongosse.Schema({
    auther :  {type:String,require:true},
    autherName :{type:String,require:true},
    autherIcone :{type:String,require:true},
    title: {type:String},
    sections :{ type: Array },
    isPublish: {type:Boolean,default:false},
    commentDisabled: {type:Boolean,default:false},
    collaborators :{ type: Array },
    rating :{ type: Array },
    likes :{ type: Array },
    tags :{ type: Array },
    date: { type: Date, default: Date.now },
    scheduleDate : String,
    formatDate: String,
    readTime:{type:Number,default:0},
    views:{ type: Array },
    shares:{ type: Array },
    attachedUsers:{type: Array}

})
articleSchema.plugin(UniqueValidator);
module.exports=mongosse.model("Article",articleSchema); 