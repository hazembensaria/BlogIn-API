const express=require("express");
const Note =require("../Models/notes");
const Link =require("../Models/links");
const checkauth = require('../../Middlewares/checkAuth');
const route=express.Router();


route.post('/save',checkauth,(req,res,next)=>{
    const note=new Note( {
        comment :req.body.comment,
        sender : req.userData.userId,
        articleId: req.body.articleId,
        senderIcon :req.body.senderIcon,
        senderName : req.body.senderName,
        title:req.body.title,
      }).save().then(note=>{
    res.status(200).send(note)
}).catch(err=>{
    console.log(err)
})
})

route.post('/saveLink',checkauth,(req,res,next)=>{
    const link=new Link( {
     
        sender : req.userData.userId,
        articleId: req.body.articleId,
        href :req.body.href,
        title:req.body.title,
      }).save().then(note=>{
    res.status(200).send(note)
}).catch(err=>{
    console.log(err)
})
})

route.post('/get',checkauth,(req,res,next)=>{
   Note.find({articleId : req.body.articleId}).sort({date : -1}).then(notes=>{
    res.status(200).send(notes)
   }).catch(err=>{
    console.log(err)
   })
})

route.post('/getLinks',checkauth,(req,res,next)=>{
    Link.find({articleId : req.body.articleId}).sort({date : -1}).then(links=>{
     res.status(200).send(links)
    }).catch(err=>{
     console.log(err)
    })
 })
 


route.post('/delete',checkauth,(req,res,next)=>{
    Note.deleteOne({_id : req.body.id}).then(notes=>{
     res.status(200).send(notes)
    }).catch(err=>{
     console.log(err)
    })
 })
 
 route.post('/deleteLink',checkauth,(req,res,next)=>{
    Link.deleteOne({_id : req.body.id}).then(link=>{
     res.status(200).send(link)
    }).catch(err=>{
     console.log(err)
    })
 })
 

module.exports=route;