const res = require("express/lib/response");
const { cookie } = require("express/lib/response");

class MinesweeperGame {
    
    constructor(diff) {
        this.board;
        this.totalMines;
        this.diff = diff;
        this.status;

        if (this.diff === "easy") {
            // The parameter in the Array object was config.rows, 
            // changed due to switching to client side creation of the board
            this.board = new Array(8);
            this.totalMines = 10;
        } else if (this.diff === "medium") {
            this.board = new Array(16);
            this.totalMines = 40;
        } else if (this.diff === "hard"){
            this.board = new Array(24);
            this.totalMines = 99;
        }

        this.generateBoard();
        this.printBoardToConsole();

        // Clear game.html body content (keep header)
        // Insert elements for game array into DOM
        // Place onclick values on the DOM elements
        // Utilize statric images? (i.e. for flag and bombs)

        // Send fetch request to server to save board database.

    }

    // Should be complete
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

    setFlag() {
        // TODO
    }

    removeFlag() {
        // TODO
    }

    makeStep() {
        // TODO
        // If Bomb or Number is clicked 
        // Returns when the "queue" for adjacant spaces is only full of number spaces, Uncover all of them
    }
    
    isGameOver() {
        // TODO
        // if numBombs == numHiddenSpaces or bomb hit
    }

    // "Chould" be complete
    printBoardToConsole() {
        for (let i=0; i<this.board.length; i++) {
            let row = board[i];
            console.log(row);
        }
    } 
}