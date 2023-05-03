/**
 * functions.js
 * Authors: Jon Khong, Carson Chapman, Matt Mitchelson
 * Desc: This javascript file is responsible for handling all of the client-side requests. This includes creating an account, logging in, viewing
 * the leaderboard, and playing the game itself.
 */
var currUser = '';
var theGame;
var ongoingGame = false;

const STATUS = {
    EMPTY: "empty",
    NUMBER: "number",
    HIDDEN: "hidden",
    FLAGGED: "flagged"
}

/**
 * This function is responsible for the client request of logging in. It submits the login information and redirects the user
 * to the next page.
 */
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

/**
 * This function is responsible for handling account creation. It takes the users info from the textboxes and sends it to the server, 
 * storing it in MongoDB.
 */
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

/**
 * This function creates a new game. It creates a new instance of the MinesweeperGame class from game.js.
 */
function createNewGame() {
    setUser();
    let difficulty = document.getElementById('gameDifficulty').value;
    theGame = new MinesweeperGame(difficulty);
    if (theGame != null) {
        document.getElementById("hintButton").innerText = "Hints: "+theGame.hints;
        printBoardToDOM();
    } else {
        alert("Error in global game creation.");
    }
    
}

/**
 * This function sets the user by using the cookie to grab the username.
 */
function setUser() {
    currUser = document.cookie.split('%22')[3]; //this separates the username from the cookie and assigns it to currUser
    if (currUser == undefined) { //checks if cookie has expired
        alert('User session expired. Please log back in.');
        window.location.href = 'index.html';
    }
}

/**
 * This function saves the users' games and redirects them back to the main page.
 */
function saveGame() {
        
    theGame.saveGame(currUser);
    window.location.href = "main.html";
    
}

/**
 * This function redirects the window to the game page.
 */
function goToGame() {
    setUser();
    window.location.href = "game.html";
}

/**
 * This function redirects the window to the leaderboard.
 */
function goToLeaderboard() {
    setUser();
    window.location.href = "leaderboard.html";
}

function goToHelpPage() {
    setUser();
    window.location.href = "help.html";
}

/**
 * This function gets the stats of the current user. 
 */
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

/**
 * This function gets all the games.
 */
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
/**
 * THis function sets the leaderboards by recording each games' status.
 * @param {*} games 
 */
function setLeaderboard(games) {
    let leaderboard = document.getElementById("leaderboardDiv");
    let difficulty = document.getElementById("leadDifficulty").value;
    console.log(difficulty);
    leaderboard.innerHTML = "";
    let topten = [];
    games.forEach((game) => {
        if (game.status === "WON" && game.difficulty === difficulty) {
            let toString = [game.username, game.difficulty, game.time];
            if (topten.length < 10) {
                topten.push(toString);
                topten.sort((a,b) => a[2] - b[2]);
            } else {
                for (let i = 0; i < topten.length; i++) {
                    if (toString[2] > topten[i][2]) {
                        topten.push(toString);
                        topten.sort((a,b) => a[2] - b[2]);
                        topten.splice(10,1);
                        break;
                    }
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
/**
 * This function redirects to the home page.
 */
function goHome() {
    setUser();
    window.location.href = "main.html";
}

/**
 * This function prints the board to DOM. It is responsible for creating the visual side of the board and the game buttons.
 * It determines whether not a player is flagging or selecting and sets the revealed cells' style.
 */
function printBoardToDOM() {
    if (theGame != null) { // checks for game
        let mainDiv = document.getElementById("gameboardDiv"); //gets the main game div
        mainDiv.innerHTML = ""; // resets main game div
        document.getElementById("flagLabel").innerText = "FLAG ("+theGame.flags+"): "
        for (let i = 0; i < theGame.size; i++) { //iterates through rows of the game board
            let row = theGame.board[i];
            let rowDiv = document.createElement("div"); //creates a div for each row
            for (let j = 0; j < theGame.size; j++) { // iterates through each cell in row
                
                box = row[j];
                let temp = document.createElement("div"); // div for each cell
                temp.style.display = "inline-block";
                let cell = document.createElement("button"); // creates a button for each cell
                cell.classList.add("gameButtons");
                cell.onclick = (() => {  // assigns onclick function to reveal the cell, need to switch to makeStep() in game.js
                    let togglebutton = document.getElementById("flagToggle");
                    if (togglebutton.value == "ON") { // flag
                        theGame.toggleFlag(i,j);
                        printBoardToDOM(); //recurses to reprint the board after cell is revealed
                        if (theGame.isGameOver()) {
                            alert(theGame.status);
                            saveGame();
                        }
                    } else { // not flag
                        reveal(i,j);
                        printBoardToDOM(); //recurses to reprint the board after cell is revealed
                        if (theGame.isGameOver()) {
                            alert(theGame.status);
                            saveGame();
                        }
                    }
                });
                if (!box[2]) { // if cell is NOT hidden, sets the button text to the cell value
                    cell.textContent = box[0];
                    if (!box[1]) { // If cell is not flagged
                        switch (box[0]) {
                            case "e":
                                cell.textContent = " ";
                                cell.style.backgroundColor = "cyan";
                                break;
                            case "1":
                                cell.style.color = "white";
                                break;
                            case "2":
                                cell.style.color = "yellow";
                                break;
                            case "3":
                                cell.style.color = "green";
                                break;
                            case "4":
                                cell.style.color = "orange";
                                break;
                            case "5":
                                cell.style.color = "pink";
                                break;
                            case "6":
                                cell.style.color = "purple";
                                break;
                            case "7":
                                cell.style.color = "blue";
                                break;
                            case "8":
                                cell.style.color = "red";
                                break;
                            case "*":
                                cell.textContent = " ";
                                cell.style.backgroundColor = "red";
                                break;
                            default:
                                break;
                        }
                    } 
                } else if (box[1]) {
                    cell.textContent = " ";
                    cell.style.backgroundColor = "green";
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

/**
 * This function reveals a cell on the game board, it uses the makeStep function to do this.
 * @param {*} row 
 * @param {*} col 
 */
function reveal(row,col) {
    console.log("see");
    theGame.makeStep(row,col);
}


/**
 * This function implements the hint feature. It gives the user a free safe pick on the board but is limited to 
 * a certain amount of hints per game and the amount is also dependent on game difficulty. It uses random to get a row and col and then uses reveal to 
 * achieve this.
 */
function giveHint() {   
    if (theGame.hints == 0) { // if out of hints
        alert("Out of hints.");
    } else {
        
        if (theGame.checkEmpties()) {
            while (true) {
                var row = Math.floor((Math.random() * theGame.size));
                var col = Math.floor((Math.random() * theGame.size));
        
                // if random selects an empty cell, set that cell to unhidden
                if (theGame.board[row][col][0] === 'e' && theGame.board[row][col][2]) {
                    reveal(row,col);
                    theGame.hints--; // subtract from amount of hints
                    document.getElementById("hintButton").innerText = "Hints: "+theGame.hints;
                    printBoardToDOM();
                    break;
                }
        
            }
        } else {
            alert("all empties revealed");
        }
    
    }
}

/**
 * This function checks if the ongoing games for the current user by searching through their games and each games' status.
 */
function checkOngoing() {
    setUser();
    let url = '/app/get/games/'+currUser;
    let p1 = fetch(url);
    p1.then((response) => {
        response.json().then((obj) => {
            let games = obj.games;
            games.forEach((game) => {
                if (game.status === "ONGOING") {
                    ongoingGame = true;
                    theGame = new MinesweeperGame(game.difficulty);
                    theGame.board = game.gameboard;
                    printBoardToDOM();
                    return;
                }
            });
        }).catch((error) => {
            alert('An error occurred');
        });
    });
}