const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const express = require('express');
const parser = require('body-parser')
const fs = require('fs');

// const connection_string = new string
// mongoose.connect(connection_string, { useNewUrlParser: true });
// mongoose.connection.on('error', () => {
//     console.log('There was a problem connecting to mongoDB');
// });

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

const app = express();
app.use(express.static('public_html'));
app.use(express.json());
// app.use('app/*/',authenticate);

app.post('/app/create/game/:user/:diff', (req, res) => {

    const {username, difficulty} = req.params;
    let config;
    switch (difficulty) {
        case 'easy':
            config = {
                rows: 8,
                cols: 8,
                mines: 10
            };
            break;
        case 'medium':
            config = {
                rows: 16,
                cols: 16,
                mines: 40
            };
            break;
        case 'hard':
            config = {
                rows: 24,
                cols: 24,
                mines: 99
            };
            break;
        default:
            res.status(400).send('Error Processing Difficulty');
    }

    let board = new Array(config.rows);
    for (let i = 0; i < config.rows; i++) {
        board[i] = new Array(config.cols);
        for (let j = 0; j < config.cols; j++) {
            board[i][j] = ['e', false, true];
        }
    }

    let mines = 0;
    while (mines < config.mines) {
        let row = Math.floor(Math.random() * config.rows);
        let col = Math.floor(Math.random() * config.cols);
        if (board[row][col][0] !== "*") {
            board[row][col][0] = "*";
            mines++;
        }
    }

    // TODO - Maybe try to make this more efficient/trivial?
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
            if (board[i][j][0] !== "*") {
                let numBombs = 0;
                for (let ii = Math.max(0, i - 1); ii <= Math.min(i + 1, config.rows - 1); ii++) {
                    for (let jj = Math.max(0, j - 1); jj <= Math.min(j + 1, config.cols - 1); jj++) {
                        if (board[ii][jj][0] === "*") {
                            numBombs++;
                        }
                    }
                }
                if (board[i][j][0] === 'e') {
                    if (numBombs === 0) {
                        board[i][j][0] = 'e';
                    } else {
                        board[i][j][0] = String(numBombs);
                    }
                }
            }
        }
    }


    // TODO - Finish logic to create a new game (Will have to change /app/ path to what

});

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

app.post('/create/user', (req, res) => {

    // TODO - Implement logic to create a new user (Stored in request body?)

});

app.post('/app/step/:user', (req, res) => {

    // TODO - Implement logic to step through a game (Will have to change /app/ path to what 
    // the authenticate function is using).


});

app.post('/app/flag/:user', (req, res) => {

    // TODO - Implement logic to flag a space (Will have to change /app/ path to what 
    // the authenticate function is using).

});


const port = 3000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));