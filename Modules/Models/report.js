const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const reportSchema=mongosse.Schema({
    articleId :  {type:String,require:true},
    articleTitle :  {type:String,require:true},
    userId :{type:String,require:true},
    userIcone :{type:String,require:true},
    userName :{type:String,require:true},
    desc: {type:String},
    problems:{type:Array,require:true},
    date: { type: Date, default: Date.now },

})
reportSchema.plugin(UniqueValidator);
module.exports=mongosse.model("Report",reportSchema); 