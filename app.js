const express=require("express");
const  Connection  = require('./config/DBConnection');

const bodyParser=require("body-parser");
const userRoutes=require("./Modules/Routes/user");
const articleRoutes=require("./Modules/Routes/article");
const notesRoutes=require("./Modules/Routes/notes");
const notificationRoutes=require("./Modules/Routes/notification");
const commentRoutes=require("./Modules/Routes/comment");
const reportRoutes=require("./Modules/Routes/report");
const app=express();
Connection()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

//----------------------------setHeaders------------------------------------------------
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin , X-Requested-With , Content-Type , Accept,authorization");//authorization to store the token
    res.header("Access-Control-Allow-Methods","GET,POST,PUT,PATCH,DELETE,OPTIONS");
    next();
})


app.use("/user",userRoutes);
app.use("/article",articleRoutes);
app.use("/notes",notesRoutes);
app.use("/notification",notificationRoutes);
app.use("/comment",commentRoutes);
app.use("/report",reportRoutes);
module.exports=app;