# CSC337_FinalPA

## Project Proposal:

    Group: Jon Khong, Carson Chapman, Matt Mitchelson
    Project: Minesweeper variant

Description:
For this project we want to build a clone to Minesweeper. Included in this project, we want to have all of the normal functionality of Minesweeper with a few additions such as, theme changes, time trials etc. For the database we want to store the usernames and passwords of every player. In addition to user logins, we want to create a schema model for the games themselves. Game model will have elements to store such as the game boards, dimensions of the board, game status - (ongoing, win, loss), username, game time(?).

## Game Logic:

For the general game logic, the server will start a game by building a gameboard of size: NxN, and placing M random 'bombs' throughout the game's board. This game object will be stored into a mongoose Schema with additional attributes to make the complete game, assigned to a user.

### (General) Logic JS

```
    // ----------Generate an empty board----------
        let board = new Array(this.rows);
        for (let i = 0; i < this.rows; i++) {
            board[i] = new Array(this.cols).fill(0);
        }
    //----------Add bombs to the board----------
        let bombsPlaced = 0;
        while (bombsPlaced < this.numBombs) {
            let row = Math.floor(Math.random() * this.rows);
            let col = Math.floor(Math.random() * this.cols);
            if (board[row][col] !== "*") {
            board[row][col] = "*";
            bombsPlaced++;
            }
        }
```

The program will then run a function that will calculate the amount of bombs that occur in a given spaces 8 adjacant spaces. Once all of this is finished the information for the gameboard will be sent back to the user hidden from them. 

```

// Set the value of each non-bomb cell to the number of bombs in its 8 neighboring cells, if there are zero cells, then the space will be blank and have a value of 0.
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            if (board[i][j] !== "*") {
              let numBombs = 0;
              for (let ii = Math.max(0, i - 1); ii <= Math.min(i + 1, this.rows - 1); ii++) {
                for (let jj = Math.max(0, j - 1); jj <= Math.min(j + 1, this.cols - 1); jj++) {
                  if (board[ii][jj] === "*") {
                    numBombs++;
                  }
                }
              }
              if (board[i][j] === 0) {
                if (numBombs === 0) {
                  board[i][j] = " ";
                } else {
                  board[i][j] = numBombs;
                }
              }
            }
          }
        }
        return board;
}
```
