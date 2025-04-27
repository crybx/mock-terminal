$(document).ready(function() {

  var parser = new ConParse();

  $(document).on('keydown', function(e) {
    // console.log('which', e.which);
    if (e.which === 8) {
      parser.backspace();
    } else if (e.which === 13) {
      parser.enter();
    } else if (e.which === 37 || e.which === 39) {
      parser.navigate(e.which === 37);
    }
  });

  $(document).on('keypress', function(e) {
    var char = String.fromCharCode(e.which);
    // console.log('hello', char, e.which);
    if (char) {
      parser.input(char);
    }
  });
  
  // Start by asking if the user wants to play a game
  parser.outputLine("Want to play a game? Type 'games' to see available games.");
});

function ConParse() {
  this.history = [];
  this.prefix = 'you@PC$ ';
  this.buffer = '';
  this.cursorLocation = 0;
  this.currentGame = null;
  this.gameActive = false;

  $('.prefix').text(this.prefix);
}

ConParse.prototype.navigate = function(left) {
  if (left) {
    if (this.cursorLocation > 0) {
      this.cursorLocation--;
      this.renderCursor();
    }
  } else {
    if (this.cursorLocation < this.buffer.length) {
      this.cursorLocation++;
      this.renderCursor();
    }
  }
};

ConParse.prototype.renderCursor = function() {
  var pad = Array(this.cursorLocation + this.prefix.length - 1);
  pad.fill('&nbsp;');
  $('.cursor-container .pad').html(pad.join(''));
};

ConParse.prototype.clear = function() {
  this.cursorLocation = -1;
  this.buffer = '';
  $('#buffer').text(this.buffer);
  this.renderCursor();
};

ConParse.prototype.backspace = function() {
  if (this.cursorLocation > 0) {
    this.buffer = this.buffer.slice(0, this.cursorLocation - 1) + this.buffer.slice(this.cursorLocation);
    this.cursorLocation--;
    $('#buffer').text(this.buffer);
    this.renderCursor();
  }
};

ConParse.prototype.outputLine = function(text) {
  $('#echo').append("<br />" + text.replace(/\n/g, "<br />"));
};

ConParse.prototype.processCommand = function(command) {
  command = command.trim().toLowerCase();
  
  if (this.gameActive && this.currentGame) {
    // Process game input
    const result = this.currentGame.processInput(command);
    this.outputLine(result.output);
    
    if (result.done) {
      this.gameActive = false;
      this.currentGame = null;
      this.outputLine("Want to play another game? Type 'games' to see available games.");
    }
    return;
  }
  
  // Process terminal commands
  switch (command) {
    case 'help':
      this.outputLine("Available commands:");
      this.outputLine("  help - Show this help message");
      this.outputLine("  games - Show available games");
      this.outputLine("  clear - Clear the terminal");
      this.outputLine("  exit - Exit (just kidding, this is a browser!)");
      break;
      
    case 'games':
      this.outputLine(GameManager.showAvailableGames());
      this.outputLine("Type the game number to start playing.");
      break;
      
    case '1':
      GameManager.games[1].play(this);
      break;
      
    case 'clear':
      $('#echo').html("Terminal cleared");
      break;
      
    case 'exit':
      this.outputLine("Nice try! This is a browser, you can't exit. Type 'games' to play games.");
      break;
      
    default:
      if (!command) {
        // Empty command, do nothing
        break;
      }
      this.outputLine("Command not recognized. Type 'help' for available commands.");
  }
};

ConParse.prototype.startGame = function(welcomeMessage, gameObj) {
  this.gameActive = true;
  this.currentGame = gameObj;
  this.outputLine(welcomeMessage);
  
  // Start the game
  const initialState = this.currentGame.processInput("");
  this.outputLine(initialState.output);
};

ConParse.prototype.enter = function() {
  console.log('Command:', this.buffer);
  this.history.push(this.buffer);
  
  // Echo the command to the terminal
  this.outputLine(this.buffer);
  
  // Process the command
  this.processCommand(this.buffer);
  
  this.clear();
};

ConParse.prototype.input = function(char) {
  this.buffer = this.buffer.slice(0, this.cursorLocation) + char + this.buffer.slice(this.cursorLocation);
  this.cursorLocation += char.length;
  $('#buffer').text(this.buffer);
  this.renderCursor();
};
