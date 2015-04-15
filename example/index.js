var asyncTimedCargo = require('async-timed-cargo');

var cargo = asyncTimedCargo(function(tasks, callback) {

  console.log('Fired');
  console.log(tasks);
  console.log(new Date());
  console.log('--------');
  callback();

}, 10, 1000);

console.log('push 1st loop');
for (var i = 0; i < 100; i++) {
  cargo.push("1st loop: " + i);
}

setTimeout(function() {
  console.log('push 2nd loop');
  for (var i = 0; i < 100; i++) {
    cargo.push("2nd loop: " + i);
  }
}, 995);

setTimeout(function() {
  console.log('push 3rd loop');
  for (var i = 0; i < 100; i++) {
    cargo.push("3rd loop: " + i);
  }
}, 1990);
