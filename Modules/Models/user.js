const mongosse=require("mongoose");
const UniqueValidator=require("mongoose-unique-validator");
const userSchema=mongosse.Schema({
    email:{type:String ,require:true,unique:true},
    password:{type:String,require:true},
    name: {type:String,require:true},
    role :{ type: String, default: 'user' },
    isnew :{ type: Boolean, default: true },
    image :{ type: String, default: 'user.png' },     
    isCollectingPoints :{ type: Boolean, default: false },  
    formatDate: String,
    age :Number,
    totalPoints : { type: Number, default: 0 },
    profession :String,
    interest : Array,
    followers :Array,
    followings :Array,
    bio :String,
    readLater : Array,
    history :Array


})
userSchema.plugin(UniqueValidator);
module.exports=mongosse.model("User",userSchema); 