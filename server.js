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
    time: Number
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

const port = 3000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));