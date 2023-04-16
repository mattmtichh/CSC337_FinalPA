const { cookie } = require("express/lib/response");

var currUser = '';

function login() {
    setUser();
    let u = document.getElementById("existingUser").value;
    let p = document.getElementById("existingPassword").value;
    let url = '/find/user/'+ u + '/' + p;
    let p1 = fetch(url)
    p1.then((response) => { 
        response.text().then((message) => {
            if (message == "login success") { 
                window.location.href = "main.html"; //reroutes if login is successful
            } else {
                alert('login failed');
            }
        });
    });
    p1.catch(error => {
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
    let difficulty = document.getElementById('gameDifficulty').value;
    let url = '/app/create/game/'+currUser+'/'+difficulty;
    // let create = fetch(url);

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

    

    // TODO: how to create a new game by fetching from the server side
}

function setUser() {
    currUser = document.cookie.split('%22')[3]; //this separates the username from the cookie and assigns it to currUser
    if (currUser == undefined) { //checks if cookie has expired
        alert('User session expired. Please log back in.')
        window.location.href = 'index.html';
    }
}