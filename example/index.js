var asyncTimedCargo = require('async-timed-cargo');

var cargo = asyncTimedCargo(function(tasks, callback) {

  console.log('Fired');
  console.log(tasks);
  console.log(new Date());
  console.log('--------');

  return callback();

}, 10, 1000);

console.log('push 1st loop');
for (var i = 0; i < 13; i++) {
  cargo.push("1st loop: " + i);
}

setTimeout(function() {
  console.log('push 2nd loop');
  for (var i = 0; i < 13; i++) {
    cargo.push("2nd loop: " + i);
  }
}, 500);

setTimeout(function() {
  console.log('push 3rd loop');
  for (var i = 0; i < 13; i++) {
    cargo.push("3rd loop: " + i);
  }
}, 1500);

setTimeout(function() {
  process.exit(0);
}, 2500);
