require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Profile = require('./models/profile');
const Room = require('./models/room');
const Message = require('./models/messages');
const  roomIdGenerator  = require('./util/roomIdGenerator');

const app = express();
const port = process.env.APP_PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
app.use(cors(corsOptions))

// Connect to DB
const db = process.env.DB_URI;
mongoose.connect(db, err => {
    if(err) {
        throw err;
    }
    else {
        console.log("Connected to MongoDB!");
    }
});

// Endpoints

app.post("/create", function(req, res){
    const newRoom =  new Room({
        name: req.body.name,
        id: roomIdGenerator.roomIdGenerator()
    })
    newRoom.save().then(console.log("Room has been added!")).catch(err => console.log("Error when creating room!"))
});

app.post('/createProfile', function(req, res) {

    const newProfile = new Profile({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    newProfile.save()
        .then(console.log("Creating profile."))
        .catch(err => console.log("Error when creating a profile: ", err));
});


app.post("/createMessage", function(req, res){
    const newMessage =  new Message({
        nickname: req.body.nickname,
        message: req.body.message,
        roomName: req.body.roomName,
        // timestamp: req.body.timestamp, NOT NEEDED CAUSE SCHEMA ADDS IT
        vote: 0
    })
    newMessage.save().then(console.log("Message has been added!")).catch(err => console.log("Error when creating message!"))
});



app.post("/upvoteMessage/:message", function(req, res){
    //newMessage.save().then(console.log("Message has been added!")).catch(err => console.log("Error when creating room!"))
  // console.log("got to post")
    Message.updateOne(
                    { message: req.params.message },
                    { $inc: {vote: +1 } }, function(err, obj){
                    if (err) throw err;}
                  //  console.log("1 document upvoted");}
    )
});

app.post("/downvoteMessage/:message", function(req, res){
    //newMessage.save().then(console.log("Message has been added!")).catch(err => console.log("Error when creating room!"))
    //console.log("got to post")
    Message.updateOne(
                    { message: req.params.message },
                    { $inc: {vote: -1 } }, function(err, obj){
                    if (err) throw err;}
                  //  console.log("1 document upvoted");}
    )
});

app.post("/searchMessage", function(req, res){
    let roomId = req.body.roomId;
    let message = req.body.message;
    Message.find({ $text: { $search: message}, roomName: roomId }).lean().then(items => { //r $text: { $search: req.body.message},
        res.json(items)
    })
})

app.post("/editMessage", function(req, res){
    console.log("Tries to edit message")
    Message.updateOne(
        {message: req.body.message, roomName: req.body.roomName},
        {$set: { message: req.body.newMessage }}, function(err, obj){
            if(err) throw err;}
        );
});

app.get("/getRooms", function(req, res){
    Room.find().lean().then(items => {
        res.json(items)
    })
});


app.get("/getMessages/:roomId", function(req, res){
    Message.find({roomName: req.params.roomId}).lean().then(items => {
        res.json(items)
    })
})

app.post('/login', function(req, res) {
    Profile.find({username: req.body.username, password: req.body.password}).lean().then(item => {
        if(item.length === 0){
            res.json(false);
        }
        else {
            res.json(true);
        }
    });
});

app.delete('/deleteMessage/:message', function(req, res){
    Message.remove({message: req.params.message}, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
    });
})

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));