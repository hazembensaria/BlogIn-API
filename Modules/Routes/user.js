
const express=require("express");
const bcrypt=require("bcrypt");
const User=require("../Models/user");
const article=require("../Models/article");
const comment=require("../Models/comment");
const notes=require("../Models/notes");
const notification=require("../Models/notification");
const report=require("../Models//report");
const jwt=require("jsonwebtoken");
const checkauth = require('../../Middlewares/checkAuth');
const  mongoose  = require("mongoose");
const user = require("../Models/user");

const route=express.Router();
//-------------------------SIGNuP--------------------------------
route.post('/signUp',(req,res,next)=>{
    // console.log('function from sign up')
    bcrypt.hash(req.body.password,10).then(hash=>{
        const user=new User({
            email:req.body.email,
            password:hash,
            name: req.body.name,
            formatDate: req.body.formatDate
        }).save().then(result=>{
            console.log(result)
            const token=jwt.sign({email:req.body.email,userId:result._id},
                "secret_this_should_be_longer",
                   {expiresIn: "24h"})
            console.log(token)
            res.status(200).send({result:result ,token: token})
           
        }).catch(error=>{   
        console.log(error)
        {res.status(400).json({message:error})}})
    })
})


//-------------------------LogIn--------------------------------

route.post("/login",(req,res,next)=>{
    let fetchedUser;
    User.findOne({email:req.body.email}).then(user=>{
        
        fetchedUser=user;
        if (!user){
            res.status(404).json({message:"user not found"});
        }
        return bcrypt.compare(req.body.password,fetchedUser.password)
    }).then(result=>{
        
        if(!result){
            res.status(404).json({message:"faild to connect here!"})
        }
        const token=jwt.sign({email:fetchedUser.email,userId:fetchedUser._id},
                              "secret_this_should_be_longer",
                                 {expiresIn: "24h"}
            );
        console.log(token)
        res.status(201).json({token:token, id : fetchedUser._id,  role:fetchedUser.role , name : fetchedUser.name});
    }).catch(error=>{
        console.log(error);
       
        res.status(400).json({message:"somthing went wrong!"})
    })
    })


    
    route.get("",checkauth , (req ,res)=>{
        const id = req.userData.userId;
       
        User.findById(id).then(resul=>{
           
            res.json(resul)
        }, err=>{
            console.log(err)
        })
    })

    route.get("/popular",checkauth , (req ,res)=>{
    
        User.aggregate([
            {$match:{$and:[{ _id:{$not:{$eq :mongoose.Types.ObjectId( req.userData.userId)}}},{followers:{$nin:[req.userData.userId]}}] } },
            {$project:{"name": 1, "bio":1, "image":1 ,"profession":1,"followers_count": { $size: "$followers" },"following_count": { $size: "$followings" }}},
            {$sort: {"followers_count" :-1}},
            {$limit:3}
        ]).then(resul=>{
           
            res.json(resul)
        }, err=>{
            console.log(err)
        })
    })


    route.get("/orderUsersByPoints",checkauth , (req ,res)=>{
    
        User.aggregate([
            
            {$project:{"name":1,"totalPoints": 1 , "image":1,"_id":1}},
            {$sort: {"totalPoints" :-1}},
          
        ]).then(resul=>{
            var index
           resul.forEach(val=>{
            if(val._id==req.userData.userId)
            // console.log( resul.indexOf(val))
            index = resul.indexOf(val)+1
        });
            res.send({resul , index}) 
        }, err=>{
            console.log(err)
        })
    })


    route.post("/changeIcon",checkauth , (req ,res)=>{
        const id = req.userData.userId;
        User.updateOne({_id:id},{$set:{image : req.body.icon}}).then(result=>{
            article.updateMany({auther:id},{$set:{autherIcone : req.body.icon}}).then(reso=>{console.log('1')})
            comment.updateMany({auther:id},{$set:{autherIcone : req.body.icon}}).then(reso=>{console.log('1')})
            notes.updateMany({sender:id},{$set:{senderIcon : req.body.icon}}).then(reso=>{console.log('1')})
            report.updateMany({userId:id},{$set:{userIcone : req.body.icon}}).then(reso=>{console.log('1')})
            notification.updateMany({sender:id},{$set:{senderIcon : req.body.icon}}).then(reso=>{console.log('1')})
         
            }).catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })

    route.post("/searchUser" , (req ,res)=>{
     
        User.find({name: {$regex: "^"+req.body.name+".*" , $options : "i"}}).then(result=>{
            res.status(200).send(result)
           })
            .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })
    route.post("/searchFreind" ,checkauth, (req ,res)=>{
     
        User.find( {$and:[{name: {$regex: "^"+req.body.name+".*" , $options : "i"}},{followers:{$in:req.userData.userId}}]} ).then(result=>{
            res.status(200).send(result)
           })
            .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })
    route.post("/userById" , (req ,res)=>{
     
        User.findById(req.body.id).then(result=>{
            res.status(200).send(result)
           })
            .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })

    route.post("/upgrade",checkauth , (req ,res)=>{

        User.updateOne({_id:req.userData.userId},
            {$set:{name: req.body.name ,
                    profession : req.body.profession,
                    age :req.body.age,
                    bio :req.body.bio,
                    interest :req.body.interest}}).then(result=>{
                        article.updateMany({auther:req.userData.userId},{$set:{autherName : req.body.name}}).then(reso=>{console.log('2')})
                        comment.updateMany({auther:req.userData.userId},{$set:{autherName : req.body.name}}).then(reso=>{console.log('2')})
                        notes.updateMany({sender:req.userData.userId},{$set:{senderName : req.body.name}}).then(reso=>{console.log('3')})
                        report.updateMany({userId:req.userData.userId},{$set:{userName : req.body.name}}).then(reso=>{console.log('4')})
                        notification.updateMany({sender:req.userData.userId},{$set:{senderName : req.body.name}}).then(reso=>{console.log('1')})
            res.status(200).send(result)
        })
        .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })   

    route.post("/followUser",checkauth,(req,res)=>{
        User.updateOne({_id:req.body.id},{$push:{followers : req.userData.userId}}).then(result=>{
                User.updateOne({_id:req.userData.userId},{$push:{followings : req.body.id}}).then(result=>{
                    console.log('added follower')
                    res.status(200).send(result)
                })
                .catch(err=>{
                    console.log('ici c l erreure'+err)
                })
          
        })
        .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })
    route.post("/unfollowUser",checkauth,(req,res)=>{
        User.updateOne({_id:req.body.id},{$pull:{followers : req.userData.userId}}).then(result=>{
                User.updateOne({_id:req.userData.userId},{$pull:{followings : req.body.id}}).then(result=>{
                    console.log('removed follower')
                    res.status(200).send(result)
                })
                .catch(err=>{
                    console.log('ici c l erreure'+err)
                })
          
        })
        .catch(err=>{
            console.log('ici c l erreure'+err)
        })
    })
    route.post("/followings",checkauth,(req,res)=>{
        User.find({ _id :{$in: req.body.followers } }).sort({date : -1}).limit(+req.query.nbFreinds).then(followers=>{
            res.status(201).json(followers)
            
        },err=>{
            console.log('something went wrong '+ err)
        })
    })
    route.post("/setUserHistory",checkauth,(req,res)=>{
        if(!req.body.allRadyExist){
            User.updateOne({_id:req.userData.userId},{$push:{history : req.body.id}}).then(result=>{
                res.status(200).send(result)
              })
              .catch(err=>{
                  console.log('ici c l erreure'+err)
              })
        }else{
            User.findOneAndUpdate({_id:req.userData.userId},{$pull:{history : req.body.id}}).then(result=>{
                console.log('ye yes')
                console.log(result.history)
                
                user.findOneAndUpdate({_id :req.userData.userId},{$push:{history : req.body.id}}).then(resu=>{
                    console.log('no no')
                    console.log(resu.history)
                    res.status(200).send(resu)  
                }).catch(ero=>{
                    console.log('ero' +ero)
                })
               
              })
              .catch(err=>{
                  console.log('ici c l erreure'+err)
              })
        }
      
    })


    
module.exports=route;

