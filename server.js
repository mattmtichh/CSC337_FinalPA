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
        type: [[Number, Number, Boolean]],
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

app.post('/app/create/game/:user', (req, res) => {

    // TODO - Implement logic to create a new game for a user (Will have to change /app/ path to what 
    // the authenticate function is using).

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