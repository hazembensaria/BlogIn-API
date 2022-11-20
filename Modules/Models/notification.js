const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const notificationSchema=mongosse.Schema({
    sender :  {type:String,require:true},
    recever :{type:String,require:true},
    articleId: String,
    isRead :{ type: Boolean, default: false },
    accepted :{ type: Boolean, default: false },
    senderIcon :{type:String,require:true},
    senderName :{type:String,require:true},
    title: {type:String},
    type: {type:String},
    date: { type: Date, default: Date.now },
    others:{type:Array,require:true},
})
notificationSchema.plugin(UniqueValidator);
module.exports=mongosse.model("Notification",notificationSchema); 