const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const express = require('express');
const parser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');

const connection_string = 'mongodb+srv://csc337:csc337@minesweepercluster.nufi7ln.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(connection_string, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
    console.log('There was a problem connecting to mongoDB');
});

var GameSchema = new mongoose.Schema( {
    username: String,
    difficulty: String,
    time: Number,
    status: Boolean, // true if game is
    gameboard: {
        type: [[[String, Boolean, Boolean]]],
        required: true
    }
})
var Games = mongoose.model('Games' , GameSchema);

var UserSchema = new mongoose.Schema( {
    username: String,
    password: String,
    salt: Number,
    hash: String,
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

    let body = req.body;
    let p1 = User.find({username: body.username}).exec();
    p1.then((results) => {
        if (results.length == 1) {

            // Issue: parsing body leaves board without the string type of its first index
            // Resolved: only parsed booleans and left string value data stringified
            var gSize = 0;
            if (req.body.difficulty == 'easy') {
                gSize = 8;
            }
            if (req.body.difficulty == 'medium') {
                gsize = 16;
            }
            if (req.body.difficulty == 'hard') {
                gsize = 24;
            }
            gb = req.body.gameboard;
            //gb = JSON.parse(req.body.gameboard);
            for (let i = 0; i < gSize; i++) {
                for (let j = 0; j < gSize; j++) {
                    //JSON.stringify(gb[i][j][0]);
                    JSON.parse(gb[i][j][1]);
                    JSON.parse(gb[i][j][2]);
                }
            }
            const game = new Games({
                username: req.body.username,
                difficulty: req.body.difficulty,
                time: req.body.time,
                gameboard: gb
            });
            game.save();
            let user = results[0];
            user.games.push(game);
            return user.save();
        } else {
            res.send('Failed.');
        }
    });
    p1.then(() => {
        res.send("Success");
    });
    p1.catch(() => {
        res.send('Failed.');
    })
});

app.get('/get/game/:user', (req,res) => { // May not need this 
    let u = req.params.user;
    let p1 = User.find({username:u}).exec();
    p1.then((results) => {
        if (results.length == 0) {
            alert("Something went wrong.");
        } else {
            let length = results[0].games.length;
            res.send(results[0].games[length-1]);
        }
    });
    p1.catch((error) => {aleconsole.logrt(error);});
})

app.get('/app/get/games/:user', (req, res) => {

    // TODO - Implement logic to get all games for a user (Will have to change /app/ path to what 
    // the authenticate function is using).
    let u = req.params.user;
    let p1 = User.find({username:u}).exec();
    p1.then((results) => {
        if (results.length == 0) {
            res.send("Something went wrong.");
        } else {
            let obj = results[0];
            res.send(obj);
        }
    });
    p1.catch((error) => {console.log(error);});
});

app.get('/get/games', (req, res) => {

    // TODO - Implement logic to get all games (Leaderboards can be accessed by anyone?)

    let p1 = Games.find().exec();
    p1.then((results) => {
        res.send(results);
    });
    p1.catch((error) => {console.log(error);});
});

app.get('/get/users', (req, res) => {

    // TODO - Implement logic to get all users (User list can be accessed by anyone?)

});

app.get('/find/user/:username/:password', (req,res) => { //checks login is good and registered
    let u = req.params.username;
    let p = req.params.password;
    let p1 = User.find({username:u}).exec();
    p1.then((results) => {
        if (results.length == 1) {
            // reHash password to see if it matches the hashed password in the database
            let toHash = p + results[0].salt;
            var hash = crypto.createHash('sha3-256');
            let data = hash.update(toHash, 'utf-8');
            let newHash = data.digest('hex');

            if (newHash === results[0].hash) { // if successful match
                let id = addSession(u); //adds cookie session
                res.cookie('login', {username:u,sid: id}, {maxAge:30000});
                res.send('login success');
            } else {
                res.send('login failed');
            }

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
            // salt and hash
            let newSalt = Math.floor((Math.random() * 1000000));
            let toHash = body.password + newSalt;
            var hash = crypto.createHash('sha3-256');
            let data = hash.update(toHash, 'utf-8');
            let newHash = data.digest('hex');

            //let newUser = new User(body);
            newUser = new User({
                username: body.username,
                password: body.password,
                salt: newSalt,
                hash: newHash,
                games: body.games
            })
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