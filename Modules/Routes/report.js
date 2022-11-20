const express=require("express");
const checkauth = require('../../Middlewares/checkAuth');
const Report = require("../Models/report");
const Article = require("../Models/article");
const route=express.Router();



route.post('/save',checkauth,(req,res,next)=>{
    const report=new Report( {
      articleId:req.body.articleId,
      articleTitle:req.body.articleTitle,
      userId:req.userData.userId,
      userIcone:req.body.userIcone,
      userName:req.body.userName,
      desc:req.body.desc,
      problems:req.body.problems
      }).save().then(comment=>{
    res.status(200).send(comment)
}).catch(err=>{
    console.log(err)
})
})

route.get('/get',checkauth,(req,res,next)=>{
    Report.distinct("articleId").then(reports=>{
        console.log(reports);
       Article.find({_id :{$in:reports}}).then(art=>{
        res.status(200).send(art)
       })
    }).catch(err=>{
        console.log(err);
    })
 })
 route.post('/getReports',checkauth,(req,res,next)=>{
 
    Report.find({articleId:req.body.id}).then(reports=>{
      res.status(200).send(reports);
    }).catch(err=>{
        console.log(err);
    })
 })
 
module.exports=route;