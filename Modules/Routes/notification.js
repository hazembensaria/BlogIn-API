const express=require("express");
const Notification=require("../Models/notification");
const Article=require("../Models/article");
const checkauth = require('../../Middlewares/checkAuth');
const user = require("../Models/user");

const route=express.Router();

route.post  ('/send',checkauth,(req,res,next)=>{
    
    if(req.body.articleId == null){
        const article=new Article({
            auther : req.body.sender,
            title: null,
            sections :[],
            autherName :req.body.senderName,
            autherIcone : req.body.senderIcon,
            formatDate:req.body.formatDate
            
               
        }).save().then(article=>{
            
            for(let recever of req.body.recever){
                // console.log(req.body.recever.splice(req.body.recever.indexOf(recever),1))
                const notification=new Notification({
                    sender :  req.body.sender,
                    recever :recever,
                    articleId: article._id,
                    senderIcon :req.body.senderIcon,
                    senderName : req.body.senderName,
                    title: req.body.title,
                    others : req.body.recever,
                    type: req.body.type
            }).save().then(notif=>{
               
            }).catch(err=>{
                console.log(err)
            })
            }
            res.status(200).send(article)
    })
    }else{
        let notif
        for(let recever of req.body.recever){
            const notification=new Notification({
                sender :  req.body.sender,
                recever :recever,
                articleId: req.body.articleId,
                senderIcon :req.body.senderIcon,
                senderName : req.body.senderName,
                title: req.body.title,
                others : req.body.recever,
                type:req.body.type
        }). save().then(note=>{
            notif = note
        }).catch(err=>{
            console.log(err)
        })
        }
        res.status(200).send(notif)
    }

  
})
route.get("",checkauth,(req ,res)=>{
    Notification.find({recever : req.userData.userId}).sort({date : -1}).then(notif=>{
        res.status(200).send(notif)
    }).catch(err=>{
        console.log(err)
    })
})


route.get("/changeState",checkauth,(req ,res)=>{
Notification.updateMany({recever: req.userData.userId} ,{$set:{isRead :true}}).then(note=>{
    res.status(201).send(note)
})
})

route.post("/changeAcceptedState",checkauth,(req ,res)=>{
    console.log(req.body.id)
    Notification.updateOne({_id: req.body.id} ,{$set:{accepted :true}}).then(note=>{
        console.log('modified')
        res.status(201).send(note)
    })
    })


    route.get("/deleteNotification",checkauth,(req ,res)=>{
        Notification.deleteMany({recever: req.userData.userId}).then(note=>{
            res.status(201).send(note)
        })
        })

 
route.post  ('/sendShareNotification',checkauth,async(req,res,next)=>{
    let notif
    if(req.body.type==='share' && req.body.exist === false){
        Article.updateOne({_id:req.body.articleId} , {$push:{shares : req.userData.userId}}).then(upd=>{
            console.log("i have hazem ben saria ")
            user.updateMany({ $or:[{_id: req.body.auther} , {_id : {$in : req.body.collabs}}] } , {$inc:{totalPoints : 10}}).then(upd=>{
                console.log('share point added')
                
            })
        })
      
    }
    for(let recever of req.body.recever){
       
        const notification=new Notification({
            sender :  req.body.sender,
            recever :recever,
            articleId: req.body.articleId,
            senderIcon :req.body.senderIcon,
            senderName : req.body.senderName,
            type: req.body.type,
            title: req.body.title,
           
    }). save().then(note=>{
        notif =note
    }).catch(err=>{
        console.log(err)
    })
    }
   
    res.status(200).send(notif)  
})       
module.exports = route ;
