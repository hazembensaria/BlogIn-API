const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const notesSchema=mongosse.Schema({
    sender :  {type:String,require:true},
    articleId: String,
    comment: String,
    senderIcon :{type:String,require:true},
    senderName :{type:String,require:true},
    title: {type:String},
    date: { type: Date, default: Date.now },
   
})
notesSchema.plugin(UniqueValidator);
module.exports=mongosse.model("Note",notesSchema); 