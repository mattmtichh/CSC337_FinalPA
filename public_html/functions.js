
var currUser = '';
var theGame;

const STATUS = {
    EMPTY: "empty",
    NUMBER: "number",
    HIDDEN: "hidden",
    FLAGGED: "flagged"
}

// COMPLETED
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

// COMPLETED
function createAccount() { 
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
    document.getElementById("newUser").value = '';
    document.getElementById("newPassword").value = '';
}

// TODO
function createNewGame() {
    setUser();
    let difficulty = document.getElementById('gameDifficulty').value;
    theGame = new MinesweeperGame(difficulty);
    if (theGame != null) {
        printBoardToDOM();
    } else {
        alert("Error in global game creation.");
    }
    
}

// COMPLETED
function setUser() {
    currUser = document.cookie.split('%22')[3]; //this separates the username from the cookie and assigns it to currUser
    if (currUser == undefined) { //checks if cookie has expired
        alert('User session expired. Please log back in.')
        window.location.href = 'index.html';
    }
}

// RENAME TO SAVE GAME?
function setBoard() {
        
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
    
}

// COMPLETED
function goToGame() {
    window.location.href = "game.html";
}

// COMPLETED
function goToLeaderboard() {
    window.location.href = "leaderboard.html";
}

// COMPLETED
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

// Might need to change with updated schema, TBD
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

// COMPLETED
function goHome() {
    setUser();
    window.location.href = "main.html";
}

// DELETE? OR MOVE POST LOGIC HERE
function saveGame() {
    // post game to be played later 
}

function printBoardToDOM() {
    if (theGame != null) { // checks for game
        let mainDiv = document.getElementById("gameboardDiv"); //gets the main game div
        mainDiv.innerHTML = ""; // resets main game div
        for (let i = 0; i < theGame.size; i++) { //iterates through rows of the game board
            let row = theGame.board[i];
            let rowDiv = document.createElement("div"); //creates a div for each row
            for (let j = 0; j < theGame.size; j++) { // iterates through each cell in row
                
                box = row[j];
                let temp = document.createElement("div"); // div for each cell
                temp.style.display = "inline-block";
                let cell = document.createElement("button"); // creates a button for each cell
                
                cell.onclick = (() => {  // assigns onclick function to reveal the cell, need to switch to makeStep() in game.js
                    reveal(i,j);
                    printBoardToDOM(); //recurses to reprint the board after cell is revealed
                    if (theGame.isGameOver()) {
                        alert(theGame.status);
                    }
                });
                if (!box[2]) { // if cell is NOT hidden, sets the button text to the cell value
                    cell.textContent = box[0];
                } else {
                    cell.textContent = " ";
                }
                temp.appendChild(cell);  // html div appending
                rowDiv.appendChild(temp);

            }
            mainDiv.appendChild(rowDiv);
        }
    } else {
        alert("No Game Found.");
    }
}

// const divList = document.querySelectorAll('div'); // Get all div elements
     // const numCols = 3;                                // Set number of columns in layout
 
     // divList.forEach((div, index) => {
     //     div.addEventListener('left-click', () => {
     //         const row = Math.floor(index / numCols) + 1; // Calculate row
     //         const col = (index % numCols) + 1;           // Calculate column
             
     //     });
     //     div.addEventListener('right-click', () => {
     //         const row = Math.floor(index / numCols) + 1; // Calculate row
     //         const col = (index % numCols) + 1;           // Calculate column
             
     //     });
     // });

function reveal(row,col) {
    theGame.board[row][col][2] = false;
}


// Hint button, loop with random rows and col on board for a spot that hasn't been selected and isn't a bomb
// [2] true to false
// TODO: make action to reveal the cell based on the onclick of the hint button,
// set limit on amount of hints used in a game. - make hints a number field in game schema and check it when hint button is clicked? 
function giveHint() {   
    if (theGame.hints == 0) { // if out of hints
        alert("Out of hints.");
    } else {
    while (true) {
        var row = Math.floor((Math.random() * theGame.size));
        var col = Math.floor((Math.random() * theGame.size));

        // if random selects an empty cell, set that cell to unhidden
        if (theGame.board[row][col][0] === 'e') {
            theGame.board[row][col][2] = false;
            theGame.hints--; // subtract from amount of hints
            break;
        }

    }
}
}
