class MinesweeperGame {
    
    constructor(diff) {
        this.board;
        this.totalMines;
        this.diff = diff;
        this.status;
        this.size;
        this.hints = 3;

        if (this.diff === "easy") {
            // The parameter in the Array object was config.rows, 
            // changed due to switching to client side creation of the board
            this.board = new Array(8);
            this.totalMines = 10;
            this.size = 8;
        } else if (this.diff === "medium") {
            this.board = new Array(16);
            this.totalMines = 40;
            this.size = 16;
        } else if (this.diff === "hard"){
            this.board = new Array(24);
            this.totalMines = 99;
            this.size = 24;
        }

        this.generateBoard();
        this.printBoardToConsole();

        // Clear game.html body content (keep header)
        // Insert elements for game array into DOM
        // Place onclick values on the DOM elements
        // Utilize statric images? (i.e. for flag and bombs)

        // Send fetch request to server to save board database.

    }

    // COMPLETE
    generateBoard() {
        if (this.board != undefined) {
            let boardSize = this.board.length;
            for (let i = 0; i < boardSize; i++) {
                this.board[i] = new Array(boardSize);
                for (let j = 0; j < boardSize; j++) {
                    this.board[i][j] = ['e', false, true];
                }
            }
        
            let mines = 0;
            while (mines < this.totalMines) {
                let row = Math.floor(Math.random() * boardSize);
                let col = Math.floor(Math.random() * boardSize);
                if (this.board[row][col][0] !== "*") {
                    this.board[row][col][0] = "*";
                    mines++;
                }
            }
    
            for (let i = 0; i < boardSize; i++) {
                for (let j = 0; j < boardSize; j++) {
                    if (this.board[i][j][0] !== "*") {
                        let numBombs = 0;
                        for (let ii = Math.max(0, i - 1); ii <= Math.min(i + 1, boardSize - 1); ii++) {
                            for (let jj = Math.max(0, j - 1); jj <= Math.min(j + 1, boardSize - 1); jj++) {
                                if (this.board[ii][jj][0] === "*") {
                                    numBombs++;
                                }
                            }
                        }
                        if (this.board[i][j][0] === 'e') {
                            if (numBombs === 0) {
                                this.board[i][j][0] = 'e';
                            } else {
                                this.board[i][j][0] = String(numBombs);
                            }
                        }
                    } 
                }
            }
        }
    }


    setFlag(x, y) {
        // TODO
    }

    removeFlag(x, y) {
        // TODO
    }

    makeStep(x, y) {
        // TODO
        // If Bomb or Number is clicked 
        // Returns when the "queue" for adjacant spaces is only full of number spaces, Uncover all of them
        
    }
    
    // COMPLETE?
    isGameOver() {
        let numBombs;
        let numHiddenSpaces;
        for (let i=0; i<this.board.length; i++) {
            let row = this.board[i];
            for (let j=0; j<row.length; j++) {
                if (row[j][0] == "*") {
                    if (row[j][2] == false) {
                        this.status = "LOST";
                        return true;
                    } else {
                        numBombs += 1;
                        numHiddenSpaces += 1;
                    }
                } 
                else if (row[j][2] == true) {
                    numHiddenSpaces += 1;
                }
            }
        }
        if (numBombs == numHiddenSpaces) {
            this.status = "WON";
            return true;
        } {
            this.status = "ONGOING";
            return false;
        }
    }

    // COMPLETE
    printBoardToConsole() {
        for (let i=0; i<this.board.length; i++) {
            let row = this.board[i];
            let res = ''
            res += "(";
            for (let element in row) {
                res += " " + row[element][0].toString() + " "
            }
            res += ")"
            console.log(res);
        }
    } 

    // saveGame(status) { // To be edited
    //     let url = "/app/create/game";
    //     let data = { 'username': currUser , 'difficulty': this.diff, 'time': Date.now(), 'status': status, 'gameboard': board};
    //     let create = fetch(url, {
    //         method: 'POST', 
    //         body: JSON.stringify(data),
    //         headers: {"Content-Type": "application/json"}
    //     });
    //     create.then((response) => { // adds listing to user schema and reroutes to home page
    //         response.text().then((message) => {
    //             if (message === "Success") {
    //                 window.location.href = "game.html";
    //             } else {
    //                 alert("Something went wrong.");
    //             }
    //         });
    //     });
    //     create.catch((error) => {
    //         console.log(error);
    //     });
    // }
}
