const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const linkSchema=mongosse.Schema({
    sender :  {type:String,require:true},
    articleId: {type:String,require:true},
    href :{type:String,require:true},
    title :{type:String,require:true},
   
    date: { type: Date, default: Date.now },
   
})
linkSchema.plugin(UniqueValidator);
module.exports=mongosse.model("Link",linkSchema); 