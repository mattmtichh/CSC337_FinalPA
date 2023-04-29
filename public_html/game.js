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

    // COMPLETE
    toggleFlag(i, j) {
        if (this.board[i][j][2] != false) {
            if (this.board[i][j][1] == false) {
                this.board[i][j][1] = true;
            } else {
                this.board[i][j][1] = false;
            }
        }
    }

    // COMPLETE?
    allNums(cellLst) {
        for (let i = 0; i < cellLst.length; i++) {
            if (cellLst[i][0] === "e" || 
                cellLst[i][0] === "*") {
                return false;
            }
        }
        return true;
    }

    // POSSIBLY COMPLETE (NEED TO TEST BFS)
    makeStep(x, y) {
        
        // If the cell is flagged, do nothing
        if (this.board[x][y][1] === true) {
            return;
        }

        // If the cell is a number or bomb, reveal tile
        if (this.board[x][y][0] !== "e") {
            this.board[x][y][2] = false;
            return;
        }

        // If the cell is empty, reveal all surrounding cells. This is done using a BFS
        // algorithm. The queue will hold the coordinates of the cells to be checked, and
        // the visited set will hold the coordinates of the cells that have already been
        // visited.
        let cellQueue = [`(${x}, ${y})`];
        let boardSize = this.board.length;
        let visited = new Set();
        while (cellQueue.length > 0) {

            const [curx, cury] = cellQueue.shift();
            let cell = this.board[x][y];
            cell[2] = false;

            // This double loop will check the 8 cells surrounding the current cell, if the cell is 
            // empty, it will be added to the queue to be checked later, if it is a number or bomb,
            // it will be ignored but still marked visited.
            for (let i = Math.max(0, curx - 1); i <= Math.min(curx + 1, boardSize - 1); i++) {
                for (let j = Math.max(0, cury - 1); j <= Math.min(cury + 1, boardSize - 1); j++) {
                    if (i === curx && j === cury) {
                        continue;
                    }
                    const coords = `(${i}, ${j})`;
                    if (!visited.has(coords)) {
                        visited.add(coords);
                        if (this.board[i][j][0] === "e") {
                            cellQueue.push(coords);
                        } 
                    }
                }
            }
        }
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
