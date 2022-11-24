const app=require("./app");
const user = require("./Modules/Models/user");
const server =  require('http').createServer(app)
const io = require('socket.io')(server , {cors:{ origin : "*"}})

app.get("/" , (req , res)=>{
    res.send('hello hazem ben saria')
})
const PORT = process.env.PORT|| 7000;
server.listen(PORT , _=>{
    console.log('you are on server');
})


let onlineUsers =[]

const addNewUser = (clientId , socketId)=>{
    if(!onlineUsers.some((user)=>user.clientId === clientId)) {
        onlineUsers.push({clientId , socketId})
    }
}

 const removeUser = (socketId)=>{ onlineUsers = onlineUsers.filter(user=>{return user.socketId!==socketId }) }


 const getUser = (clientId)=>{ return onlineUsers.find(user=>user.clientId === clientId)} 

io.on('connection' , (socket)=>{
    io.emit('aa' , '{n :1}')
    socket.on('newUser', (clientId)=>{
        // console.log('a user connected')
        addNewUser(clientId ,socket.id)
        // console.log(onlineUsers)
    })


    socket.on('disconnect',_=>{
        removeUser(socket.id)
        // console.log(onlineUsers)
        // console.log('user left')
      
    })

    socket.on('sendNotification', (recevers)=>{
        for(let rec of recevers){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
           io.to(recever.socketId).emit('getNotification' , '{n :111111}')
        }
      
    })

    socket.on('sendFollowNotification', (recever)=>{
      
              console.log(recever)
            const user = getUser(recever)
          
            if(user)
           io.to(user.socketId).emit('getFollowNotification' , '{n :111111}')
        
      
    })


    socket.on('updateArticle',(obj)=>{
       
        for(let rec of obj.collab){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
        io.to(recever.socketId).emit('getArticleUpdated' , {title :obj.title , section : obj.section})
        }
    })
   
    socket.on('saveNote',(obj)=>{
       
        for(let rec of obj.collab){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
        io.to(recever.socketId).emit('getNotes' , 'ok')
        }
    })
    socket.on('saveLink',(obj)=>{
       
        for(let rec of obj.collab){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
        io.to(recever.socketId).emit('getLinks' , 'ok')
        }
    })
   
   
    socket.on('deleteNote',(obj)=>{
       
        for(let rec of obj.collab){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
            io.to(recever.socketId).emit('NotesDeleted' , 'ok')
        }
    })
   
    socket.on('deleteLink',(obj)=>{
       
        for(let rec of obj.collab){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
        io.to(recever.socketId).emit('linksDeleted' , 'ok')
        }
    })
   

    socket.on('deleteSection',(obj)=>{
       
        for(let rec of obj.collab){
            
            const recever = getUser(rec)
            // console.log(recever)
            if(recever)
        io.to(recever.socketId).emit('sectionDeleted' , {item : obj.item})
        }
    })
})