const res = require("express/lib/response");
const { cookie } = require("express/lib/response");

var currUser = '';
var gameBoard;

function login() {
    let u = document.getElementById("existingUser").value;
    let p = document.getElementById("existingPassword").value;
    let url = '/find/user/'+ u + '/' + p;
    let login = fetch(url)
    login.then((response) => { 
        response.text().then((message) => {
            if (message == "login success") { 
                window.location.href = "main.html"; //reroutes if login is successful
                setUser();
            } else {
                alert('login failed');
            }
        });
    });
    login.catch(error => {
        alert(error);
    });
    document.getElementById("existingUser").value = '';
    document.getElementById("existingPassword").value = '';
}

function createAccount() { // need to figure out password salting and hashing
    let u = document.getElementById("newUser").value;
    let p = document.getElementById("newPassword").value;
    let g = [];
    let url = '/create/user/';
    let data = { username: u, password: p, games: g};
    let create = fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    });
    create.then((response) => {
        response.text().then((message) => {
            alert(message);
        })
    });
    create.catch((error) => alert(error));
    document.getElementById("newUser").value = ''; //resets textbox
    document.getElementById("newPassword").value = '';
}

function createNewGame() {
    setUser();
    let u = currUser;
    let url = "/get/game/"+u;
    let get = fetch(url);
    get.then(response => response.json())
    get.then(data => {
        gameBoard = data;
        console.log(gameBoard);
        alert("Game is here");
    });
    get.catch((error) => {alert(error);});
}

function setUser() {
    currUser = document.cookie.split('%22')[3]; //this separates the username from the cookie and assigns it to currUser
    if (currUser == undefined) { //checks if cookie has expired
        alert('User session expired. Please log back in.')
        window.location.href = 'index.html';
    }
}

function setBoard() {
    setUser();
    let diff = document.getElementById('gameDifficulty').value;
    var board;
    var totalMines;
    if (diff === "easy") {
        board = new Array(8); // the parameter in the Array object was config.rows, changed due to switching to client side creation of the board
        totalMines = 10;
    } else if (diff === "medium") {
        board = new Array(16);
        totalMines = 40;
    } else if (diff === "hard"){
        board = new Array(24);
        totalMines = 99;
    }

    if (board != undefined) {
        let boardSize = board.length;
        for (let i = 0; i < boardSize; i++) {
            board[i] = new Array(boardSize);
            for (let j = 0; j < boardSize; j++) {
                board[i][j] = ['e', false, true];
            }
        }
    
        let mines = 0;
        while (mines < totalMines) {
            let row = Math.floor(Math.random() * boardSize);
            let col = Math.floor(Math.random() * boardSize);
            if (board[row][col][0] !== "*") {
                board[row][col][0] = "*";
                mines++;
            }
        }

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j][0] !== "*") {
                    let numBombs = 0;
                    for (let ii = Math.max(0, i - 1); ii <= Math.min(i + 1, boardSize - 1); ii++) {
                        for (let jj = Math.max(0, j - 1); jj <= Math.min(j + 1, boardSize - 1); jj++) {
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
        
        let url = "/app/create/game";
        let data = { username: currUser , difficulty: diff, time: Date.now(), gameboard: board};
        let create = fetch(url, {
            method: 'POST', 
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        create.then(() => { // adds listing to user schema and reroutes to home page
            alert('Game created');
            window.location.href = "game.html";
        });
        create.catch(
            error => console.error(error)
        );
    } else {
        alert("Something went wrong.");
    }
}