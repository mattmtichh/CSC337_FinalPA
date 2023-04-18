const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const express = require('express');
const parser = require('body-parser')
const fs = require('fs');

const connection_string = 'mongodb+srv://csc337:csc337@minesweepercluster.nufi7ln.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
    console.log('There was a problem connecting to mongoDB');
});

var GameSchema = new mongoose.Schema( {
    user: String,
    difficulty: String,
    time: Number,
    gameboard: {
        type: [[String, Boolean, Boolean]],
        required: true
    }
})
var Games = mongoose.model('Games' , GameSchema);

var UserSchema = new mongoose.Schema( {
    username: String,
    password: String,
    games: [GameSchema]
})
var User = mongoose.model('User', UserSchema);


// need to change these next functions to work better for the app, just copied from PA 10
let sessions = [];

function addSession(user) {
    let sessionID = Math.floor(Math.random() * 100000);
    let sessionStart = Date.now();
    sessions[user] = {'sid': sessionID, 'start': sessionStart};
    return sessionID;
}

function doesUserHaveSession(user,sessionID) {
    let entry = sessions[user];
    if (entry != undefined) {
        return entry.sid == sessionID;
    }
    return false;
}

const SESSION_LENGTH = 30000;

function cleanUpSessions() {
    let currentTime = Date.now();
    for (i in sessions) {
        let sess = sessions[i];
        if (sess.start + SESSION_LENGTH < currentTime) {
            console.log('ending session for '+i);
            delete sessions[i];
        }
    }
}

setInterval(cleanUpSessions, 2000);

function authenticate(req,res,next) {
    let c = req.cookies;
    if (c && c.login) {
        let result = doesUserHaveSession(c.login.username,c.login.sid);
        if (result) {
            next();
            return;
        }
    }
    res.redirect('/index.html');
}

const app = express();
app.use(express.static('public_html'));
app.use(express.json());
app.use('app/*/',authenticate);

app.post('/app/create/game/', (req, res) => {

    // const {username, difficulty} = req.params;
    // let config;
    // switch (difficulty) {
    //     case 'easy':
    //         config = {
    //             rows: 8,
    //             cols: 8,
    //             mines: 10
    //         };
    //         break;
    //     case 'medium':
    //         config = {
    //             rows: 16,
    //             cols: 16,
    //             mines: 40
    //         };
    //         break;
    //     case 'hard':
    //         config = {
    //             rows: 24,
    //             cols: 24,
    //             mines: 99
    //         };
    //         break;
    //     default:
    //         res.status(400).send('Error Processing Difficulty');
    // }

    let body = JSON.parse(req.body);
    let p1 = User.find({username: body.username}).exec();
    p1.then((results) => {
        if (results.length == 1) {
            const game = new Games(body);
            game.save();
            let user = results[0];
            console.log(user.games);
            user.games.push(game);
            user.save();
        } else {
            res.send('Failed.');
        }
    });
    p1.catch(() => {
        res.send('Failed.');
    })
//     let p2 = Games.find().exec();
//     p2.then(() => {
//         let game = new Games(body);
//         game.save();
//     })
//     p2.catch((error) => {alert(error)});
});

app.get('/get/game/:user', (req,res) => {
    let u = req.params.user;
    let p1 = User.find({username:u}).exec();
    p1.then((results) => {
        if (results.length == 0) {
            alert("Something went wrong.");
        } else {
            let length = results[0].games.length;
            console.log(results[0].games);
            res.send(results[0].games[length-1]);
        }
    });
    p1.catch((error) => {alert(error);});
})

app.get('/app/get/games/:user', (req, res) => {

    // TODO - Implement logic to get all games for a user (Will have to change /app/ path to what 
    // the authenticate function is using).
});

app.get('/get/games', (req, res) => {

    // TODO - Implement logic to get all games (Leaderboards can be accessed by anyone?)

});

app.get('/get/users', (req, res) => {

    // TODO - Implement logic to get all users (User list can be accessed by anyone?)

});

app.get('/find/user/:username/:password', (req,res) => { //checks login is good and registered
    let u = req.params.username;
    let p = req.params.password;
    let p1 = User.find({username:u, password: p}).exec();
    p1.then((results) => {
        if (results.length > 0) {
            let id = addSession(u); //adds cookie session
            res.cookie('login', {username:u,sid: id}, {maxAge:30000});
            res.send('login success');
        } else {
            res.send('login failed');
        }
    })
    .catch((error) => {
        res.send('FAIL');
    });
});

app.post('/create/user', (req, res) => {
    // TODO - Implement logic to create a new user (Stored in request body?)
    let body = req.body;
    let p1 = User.find({username: body.username}).exec();
    p1.then((results) => {
        if(results.length > 0) {  
            res.send('Username already taken');
        } else {
            let newUser = new User(body);
            let save = newUser.save();
            save.then( (doc) => {
                res.send('User successfully created');
            })
            save.catch( (err) => {
                res.send(err);
            });
        }
    })
    p1.catch((error) => {res.status(500).send('Internal server error')});
});

app.post('/app/step/:user', (req, res) => {

    // TODO - Implement logic to step through a game (Will have to change /app/ path to what 
    // the authenticate function is using).


});

app.post('/app/flag/:user', (req, res) => {

    // TODO - Implement logic to flag a space (Will have to change /app/ path to what 
    // the authenticate function is using).

});


const port = 5000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));