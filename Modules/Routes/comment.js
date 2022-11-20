const express=require("express");

const checkauth = require('../../Middlewares/checkAuth');
const comment = require("../Models/comment");

const route=express.Router();

route.post('/save',checkauth,(req,res,next)=>{
    const note=new comment( {
        auther:req.body.auther,
        autherName:req.body.autherName,
        autherIcone:req.body.autherIcone,
        content:req.body.content,
        articleId:req.body.articleId
      }).save().then(comment=>{
    res.status(200).send(comment)
}).catch(err=>{
    console.log(err)
})
})

route.post('/get',checkauth,(req,res,next)=>{
    comment.find({articleId : req.body.articleId}).sort({date : -1}).then(comments=>{
     res.status(200).send(comments)
    }).catch(err=>{
     console.log(err)
    })
 })
 
 route.post("/like",checkauth , (req ,res)=>{
    if(!req.body.isLikedByUser){

        comment.updateOne({_id:req.body.id},{$push:{likes : req.userData.userId}}).then(result=>{
            console.log('liked')
            res.status(200).send(result)
        })
        .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    }else{
        comment.updateOne({_id:req.body.id},{$pull:{likes : req.userData.userId}}).then(result=>{
            console.log('removed like')
            res.status(200).send(result)
        })
        .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    }
   
})  
module.exports=route;