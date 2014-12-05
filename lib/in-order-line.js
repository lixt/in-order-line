var util      = require('util')
  , Transform = require('stream').Transform
  ;

function InorderLine(linecb, lastcb, options) {

  this.linecb      = linecb;
  this.lastcb      = lastcb;

  options          = options || {};
  this.seperator   = options.separator  || '\n';
  this.encoding    = options.encoding   || 'utf-8';
  this.bufferSize  = options.bufferSize || 1024;

  this.linebuffer  = [];
  this.preChunk    = new String();
  this.pushcount   = 0;
  this.linecount   = 0;
  this.linetotal   = undefined;
  this.flushdone   = undefined;

  var options = {
    highWaterMark: this.bufferSize
  };
  Transform.call(this, options);
};
util.inherits(InorderLine, Transform);

InorderLine.prototype._transform = function(chunk, encoding, done) {
  var that = this;

  if (util.isBuffer(chunk)) {
    chunk = chunk.toString(that.encoding);
  }
  chunk = that.preChunk + chunk;

  var result = separate(that, chunk);
  var lines = result.lines;
  that.preChunk = result.remains;

  lines.forEach(function(line) {
    var linecount = ++that.linecount;

    that.linecb(null, line, function(lineresult) {
      that.linebuffer[linecount - 1] = lineresult;
      linecheck(that);
    });
  });

  done();
};

InorderLine.prototype._flush = function(done) {
  var that = this;

  that.flushdone = done;

  if (!that.preChunk) {
    that.linetotal = that.linecount;
    if (that.pushcount === that.linetotal) {
      linelast(that);
    }
  } else {
    that.linetotal = ++that.linecount;
    that.linecb(null, that.preChunk, function(lineresult) {
      that.linebuffer[that.linetotal - 1] = lineresult;
      linecheck(that);
    });
  }
};

function linelast(context) {
  context.lastcb && context.lastcb(function(lastresult) {
    if (lastresult) {
      context.push(lastresult.toString(), context.encoding);
    }
    context.push(null);
    context.flushdone();
  });
}

function linecheck(context) {
  var lineresults = [];

  for (var i = context.pushcount; i < context.linecount; ++i) {
    var lineresult = context.linebuffer[i];

    if (lineresult === undefined || lineresult === null) {
      break;
    } else {
      ++context.pushcount;
      lineresults.push(lineresult);
    }
  }

  if (lineresults.length > 0) {
    context.push(lineresults.join(context.seperator)
      +context.seperator, context.encoding);
  }

  // Check if all the lines are done.
  if (context.linetotal !== undefined
    && context.pushcount === context.linetotal) {

    linelast(context);
  }
}

function separate(context, chunk) {
  var result = {
    lines: [],
    remains: chunk
  };

  var index;
  while((index = chunk.indexOf(context.seperator)) !== -1) {
    var line = chunk.slice(0, index);

    if (line) {
      result.lines.push(line);
    }
    chunk = chunk.slice(index + 1);
  }

  result.remains = chunk;
  return result;
}

module.exports = InorderLine;