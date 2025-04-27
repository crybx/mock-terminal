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
});

function ConParse() {
  this.history = [];
  this.prefix = 'you@PC$ ';
  this.buffer = '';
  this.cursorLocation = 0;
  this.input('yes');

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

ConParse.prototype.enter = function() {
  console.log('Command:', this.buffer);
  this.history.push(this.buffer);
  $('#echo').append("<br />" + this.buffer);
  this.clear();
};

ConParse.prototype.input = function(char) {
  this.buffer = this.buffer.slice(0, this.cursorLocation) + char + this.buffer.slice(this.cursorLocation);
  this.cursorLocation += char.length;
  $('#buffer').text(this.buffer);
  this.renderCursor();
};
