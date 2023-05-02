/**
 * game.js
 * Author: Jon Khong, Carson Chapman, Matt Mitchelson
 * Desc: This javascript file is responsible for handling the games' functionality. It is essentially the game itself. 
 * It handles all the requests of generating the board, checks if the game is over, makes the steps (select logic), 
 * toggles flag, saves the game and prints the board to console.
 */
class MinesweeperGame {
    
    constructor(diff) {
        this.board;
        this.totalMines;
        this.diff = diff;
        this.status;
        this.size;
        this.hints;
        this.startTime = new Date().getTime();

        if (this.diff === "easy") {
            // The parameter in the Array object was config.rows, 
            // changed due to switching to client side creation of the board
            this.board = new Array(8);
            this.totalMines = 10;
            this.size = 8;
            this.hints = 1;
        } else if (this.diff === "medium") {
            this.board = new Array(16);
            this.totalMines = 40;
            this.size = 16;
            this.hints = 2;
        } else if (this.diff === "hard"){
            this.board = new Array(24);
            this.totalMines = 99;
            this.size = 24;
            this.hints = 3;
        }

        this.generateBoard();
        this.printBoardToConsole();
    }

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

    toggleFlag(i, j) {
        if (this.board[i][j][2]) {
            if (!this.board[i][j][1]) {
                this.board[i][j][1] = true;
            } else {
                this.board[i][j][1] = false;
            }
        }
    }

    allNums(cellLst) {
        for (let i = 0; i < cellLst.length; i++) {
            if (cellLst[i][0] === "e" || 
                cellLst[i][0] === "*") {
                return false;
            }
        }
        return true;
    }

    /**
     * Makes step logic using BFS, checking all adjacent cells of selected cells and those adjacent cells' adjacent cells.
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
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
        let cellQueue = new Array();
        let coord = [x, y];
        cellQueue.push(coord);

        console.log("x, y, cellQueue:");
        console.log(x);
        console.log(y);
        console.log(cellQueue);

        let boardSize = this.board.length;
        let visited = new Array();
        while (cellQueue.length > 0) {
            console.log("Starting While Loop.");
            console.log("Before Shift: ");
            console.log(cellQueue);
            const [curx, cury] = cellQueue.pop();
            console.log("cellQueue Shifted: ");
            console.log(cellQueue);
            console.log(curx);
            console.log(cury);

            this.board[curx][cury][2] = false;

            // This double loop will check the 8 cells surrounding the current cell, if the cell is 
            // empty, it will be added to the queue to be checked later, if it is a number or bomb,
            // it will be ignored but still marked visited.
            for (let i = Math.max(0, curx - 1); i <= Math.min(curx + 1, boardSize - 1); i++) {
                for (let j = Math.max(0, cury - 1); j <= Math.min(cury + 1, boardSize - 1); j++) {
                    if (i == curx && j == cury) {
                        continue;
                    }
                    const coords = [i, j];
                    if (visited.includes(coords) == false) {
                        visited.push(coords);
                        if (this.board[i][j][0] === "e" && !this.board[i][j][1] && this.board[i][j][2]) {
                            cellQueue.push(coords);
                        } else if (this.board[i][j][0] !== "e" && this.board[i][j][0] !== "*"){
                            this.board[i][j][2] = false;
                        }
                    }
                }
            }
            console.log("Visited: "); 
            console.log(visited);
            console.log("Cell Queue: ");
            console.log(cellQueue);
        }
    }
    
    isGameOver() {
        let numBombs = 0;
        let numHiddenSpaces = 0;
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

    saveGame(user) { 
        let endTime = new Date().getTime();
        let totalTime =  (endTime - this.startTime) / 1000;
        console.log(this.status);
        console.log(totalTime);
        let url = "/app/save/game";
        let data = { 'username': user , 'difficulty': this.diff, 'time': totalTime, 'status': this.status, 'gameboard': this.board};
        let create = fetch(url, {
            method: 'POST', 
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        create.then((response) => { // adds listing to user schema and reroutes to home page
            response.text().then((message) => {
                if (message === "Success") {
                    alert("Game saved successfully. Taking you back to main page.");
                } else {
                    alert("Something went wrong.");
                }
            });
        }); 
        create.catch((error) => {
            console.log(error);
        });
    }
}