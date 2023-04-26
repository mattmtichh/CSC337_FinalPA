
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
    // let u = currUser;
    // let url = "/get/game/"+u;
    // let get = fetch(url);
    // get.then(response => response.json())
    // get.then(data => {
    //     gameBoard = data;
    //     alert("Game is here");
    // });
    // get.catch((error) => {alert(error);});
    let difficulty = document.getElementById('gameDifficulty').value;
    var newGame = new MinesweeperGame(difficulty);
    newGame.printBoardToConsole();
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
    let diff = "easy" //document.getElementById('gameDifficulty').value;
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
        let data = { 'username': currUser , 'difficulty': diff, 'time': Date.now(), 'gameboard': board};
        let create = fetch(url, {
            method: 'POST', 
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        create.then((response) => { // adds listing to user schema and reroutes to home page
            response.text().then((message) => {
                if (message === "Success") {
                    window.location.href = "game.html";
                } else {
                    alert("Something went wrong.");
                }
            });
        });
        create.catch((error) => {
            console.log(error);
        });
    } else {
        alert("Something went wrong.");
    }
}

function goToGame() {
    window.location.href = "game.html";
}

function goToLeaderboard() {
    window.location.href = "leaderboard.html";
}

function getMyStats() {
    setUser();
    let url = '/app/get/games/'+currUser;
    let p1 = fetch(url);
    p1.then((response) => {
        response.json().then((obj) => {
            let games = obj.games;
            setLeaderboard(games);
        }).catch((error) => {
            alert('An error occurred');
        });
    });
}

function getGlobal() {
    setUser();
    let url = '/get/games/';
    let p1 = fetch(url);
    p1.then((response) => {
        response.json().then((games) => {
            setLeaderboard(games);
        }).catch((error) => {
            alert('An error occurred');
        });
    });
}

function setLeaderboard(games) {
    let leaderboard = document.getElementById("leaderboardDiv");
    leaderboard.innerHTML = "";
    let topten = [];
    games.forEach((game) => {
        let toString = [game.username, game.difficulty, game.time];
        if (topten.length < 10) {
            topten.push(toString);
            topten.sort((a,b) => b[2] - a[2]);
        } else {
            for (let i = 0; i < topten.length; i++) {
                if (toString[2] > topten[i][2]) {
                    topten.push(toString);
                    topten.sort((a,b) => b[2] - a[2]);
                    topten.splice(10,1);
                    break;
                }
            }
        }
    });
    for (let i = 0; i < topten.length; i++) {
        let game = topten[i];
        let gameDiv = document.createElement("div");
        let userDiv = document.createElement("div");
        let diffDiv = document.createElement("div");
        let timeDiv = document.createElement("div");
        userDiv.textContent = (i+1) + ". User: " + game[0];
        userDiv.style.margin = "5px";
        diffDiv.textContent =  "Difficulty: " + game[1];
        diffDiv.style.margin = "5px";
        timeDiv.textContent = "Time: " + game[2];
        timeDiv.style.margin = "5px";
        gameDiv.append(userDiv);
        gameDiv.append(diffDiv);
        gameDiv.append(timeDiv);
        gameDiv.style.backgroundColor = "rgb(0, 115, 208)";
        gameDiv.style.color = "white";
        gameDiv.style.padding = "10px";
        gameDiv.style.margin = "3%";
        gameDiv.style.borderRadius = "10px";
        leaderboard.appendChild(gameDiv);
    }
}

function goHome() {
    setUser();
    window.location.href = "main.html";
}

function saveGame() {
    // post game to be played later 
}