const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const commnetSchema=mongosse.Schema({
    auther :  {type:String,require:true},
    autherName :{type:String,require:true},
    autherIcone :{type:String,require:true},
    content: {type:String},
    likes:Array,
    articleId:{type:String,require:true},
    date: { type: Date, default: Date.now },
    

})
commnetSchema.plugin(UniqueValidator);
module.exports=mongosse.model("Comment",commnetSchema); 