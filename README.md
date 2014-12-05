# in-order-line
Asynchronous ordered line-by-line stream transformer.

## Install
```bash
npm install in-order-line
```

## Usage
The constructor will return an instance of `InOrderLine`.  `InOrderLine` can be 
used as a stream transformer. Upon each incoming new line, the given callback
is called with three parameters: error occurs, the line read and a callback
called with the result when the line transforming is over.
```js
var InOrderLine = require('in-order-line');
var timeout = [1000, 2000, 3000];
var transformer = new InOrderLine(function(err, line, done) {
  setTimeout(function() {
    done(line);
  }, (line.length % 3)); // Randomly choose the time. 
});
var istream = ... // Readable stream.
var ostream = ... // Writable stream.
istream.pipe(transformer).pipe(ostream);
```
Input : `abc\nab\na\n`
Output: `abc\nab\na\n`

The constructor can also take another callback called once all the lines are
done. The given callback is called with one parameter: a callback called with
the result when the line additional processing is over.
```js
var InOrderLine = require('in-order-line');
var timeout = [1000, 2000, 3000];
var transformer = new InOrderLine(
function(err, line, done) {
  setTimeout(function() {
    done(line);
  }, (line.length % 3)); // Randomly choose the time. 
}, 
function(done) {
  done('this is the end.');  
});
var istream = ... // Readable stream.
var ostream = ... // Writable stream.
istream.pipe(transformer).pipe(ostream);
```
Input : `abc\nab\na\n`
Output: `abc\nab\na\nthis is the end\n`

The constructor can also an option as the parameter for advanced usage.
`separator`: User-defined line separator, default is '\n'.
`encoding`: User-defined in-coming and out-coming stream encoding, default is 'utf-8'
```js
var InOrderLine = require('in-order-line');
var timeout = [1000, 2000, 3000];
var transformer = new InOrderLine(
function(err, line, done) {
  setTimeout(function() {
    done(line);
  }, (line.length % 3)); // Randomly choose the time. 
}, 
function(done) {
  done('this is the end.');  
}, 
{
  separator: '\n\t',
  encoding: 'base64'
});
var istream = ... // Readable stream.
var ostream = ... // Writable stream.
istream.pipe(transformer).pipe(ostream);
```

## License
MIT
