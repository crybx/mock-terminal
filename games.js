// Game implementations for mock terminal

// Tower of Hanoi Game
const TowerOfHanoi = {
  createTowers: function() {
    return [[3, 2, 1], [], []];
  },

  getTowerPiece: function(value) {
    if (value === 1) {
      return "   [=|=]   ";
    } else if (value === 2) {
      return "  [==|==]  ";
    } else if (value === 3) {
      return " [===|===] ";
    } else {
      return "     |     ";
    }
  },

  drawTowers: function(towers) {
    let rows = ["", "", ""];
    for (let x = 0; x < 3; x++) {
      const tower = towers[x];
      for (let y = 0; y < 3; y++) {
        if (y < tower.length) {
          rows[y] += this.getTowerPiece(tower[y]);
        } else {
          rows[y] += this.getTowerPiece(0);
        }
      }
    }

    // Return the rows in reverse order
    let output = rows.slice().reverse().join("\n");
    output += "\n ----1----  ----2----  ----3---- ";
    return output;
  },

  validateMove: function(towers, fromTower, toTower) {
    // Check if the move is valid
    if (fromTower < 0 || fromTower > 2 || toTower < 0 || toTower > 2) {
      return "No... input should be 1, 2, or 3";
    }
    
    if (towers[fromTower].length === 0) {
      return "Invalid move: No disk to move from that tower";
    }
    
    if (towers[toTower].length > 0 && towers[fromTower][towers[fromTower].length - 1] > towers[toTower][towers[toTower].length - 1]) {
      return "Invalid move: Cannot place a larger disk on a smaller one";
    }
    
    return null; // Valid move
  },

  makeMove: function(towers, fromTower, toTower) {
    // Move the disk
    towers[toTower].push(towers[fromTower].pop());
    return towers;
  },

  checkWin: function(towers) {
    return towers[2].length === 3;
  }
};

// Game Manager
const GameManager = {
  games: {
    1: { name: "Tower of Hanoi", play: function(terminal) { GameManager.playTowerOfHanoi(terminal); } }
    // More games can be added here
  },
  
  showAvailableGames: function() {
    let output = "Available games:";
    for (const gameId in this.games) {
      output += `\n  ${gameId}: ${this.games[gameId].name}`;
    }
    return output;
  },
  
  playTowerOfHanoi: function(terminal) {
    const game = {
      towers: TowerOfHanoi.createTowers(),
      moves: 0,
      state: "intro", // intro, from_prompt, to_prompt, game_over
      fromTower: null,
      
      processInput: function(input) {
        if (input.toLowerCase() === "exit") {
          return { output: "Exiting Tower of Hanoi. Goodbye!", done: true };
        }
        
        switch (this.state) {
          case "intro":
            this.state = "from_prompt";
            return { 
              output: TowerOfHanoi.drawTowers(this.towers) + "\nWhich tower do you want to move from? (1-3): ", 
              done: false 
            };
            
          case "from_prompt":
            const fromTower = parseInt(input) - 1;
            if (isNaN(fromTower) || fromTower < 0 || fromTower > 2) {
              return { output: "No... input should be 1, 2, or 3\nWhich tower do you want to move from? (1-3): ", done: false };
            }
            this.fromTower = fromTower;
            this.state = "to_prompt";
            return { output: "Which tower do you want to move to? (1-3): ", done: false };
            
          case "to_prompt":
            const toTower = parseInt(input) - 1;
            if (isNaN(toTower) || toTower < 0 || toTower > 2) {
              return { output: "No... input should be 1, 2, or 3\nWhich tower do you want to move to? (1-3): ", done: false };
            }
            
            const errorMsg = TowerOfHanoi.validateMove(this.towers, this.fromTower, toTower);
            if (errorMsg) {
              this.state = "from_prompt";
              return { 
                output: errorMsg + "\n" + TowerOfHanoi.drawTowers(this.towers) + "\nWhich tower do you want to move from? (1-3): ", 
                done: false 
              };
            }
            
            // Make the move
            TowerOfHanoi.makeMove(this.towers, this.fromTower, toTower);
            this.moves++;
            
            // Check for win
            if (TowerOfHanoi.checkWin(this.towers)) {
              this.state = "game_over";
              return { 
                output: TowerOfHanoi.drawTowers(this.towers) + `\nCongratulations! You won in ${this.moves} moves!\nPlay again? (y/n): `, 
                done: false 
              };
            }
            
            // Continue the game
            this.state = "from_prompt";
            return { 
              output: TowerOfHanoi.drawTowers(this.towers) + "\nWhich tower do you want to move from? (1-3): ", 
              done: false 
            };
            
          case "game_over":
            if (input.toLowerCase() === "y") {
              // Reset the game
              this.towers = TowerOfHanoi.createTowers();
              this.moves = 0;
              this.state = "from_prompt";
              return { 
                output: "Starting a new game!\n" + TowerOfHanoi.drawTowers(this.towers) + "\nWhich tower do you want to move from? (1-3): ", 
                done: false 
              };
            } else {
              return { output: "Thanks for playing Tower of Hanoi!", done: true };
            }
        }
      }
    };
    
    // Start the game by returning the initial state
    terminal.startGame("Welcome to the Tower of Hanoi!", game);
  }
};