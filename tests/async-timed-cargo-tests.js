var chai    = require('chai'),
    sinon   = require('sinon'),
    async   = require('async'),
    expect  = chai.expect,
    assert  = chai.assert,
    asyncTimedCargo = require('../lib/async-timed-cargo');

describe('async-timed-cargo', function() {

  var clock = null;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  describe('calls without callback', function() {

    it('it flushes after adding more itens than payload', function(done) {

      var items = [];
      for (var i = 0; i < 100; i++) {
        items.push(i);
      }
      var ticks = 0;

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.equal(tasks.length, 10);
        ticks++
        if(ticks == 10) {
          cargo.stop();
          done();
        }
        callback();
      }, 10, 8000);

      items.forEach(function(item) {
        cargo.push(item);
      });

    });

    it('it flushes after timeout occurs', function(done) {

      var items = [1, 2, 3, 4, 5];

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.equal(tasks.length, items.length);
        cargo.stop();
        callback();
        done();
      }, 100, 5000);

      items.forEach(function(item) {
        cargo.push(item);
      });

      clock.tick(5000);

    });

    it('it flushes for each timeout that occurs', function(done) {

      var items = [1, 2, 3, 4, 5];
      var ticked = 0;

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.equal(tasks.length, items.length);
        ticked++;
        if (ticked == 3) {
          cargo.stop();
          done();
        }
        callback();
      }, 100, 5000);

      // tick 1
      items.forEach(function(item) {
        cargo.push(item);
      });
      clock.tick(5000);

      // tick 2
      items.forEach(function(item) {
        cargo.push(item);
      });
      clock.tick(5000);

      // tick 3
      items.forEach(function(item) {
        cargo.push(item);
      });
      clock.tick(5000);


    });

    it('it allows pushing items asyncronously', function(done) {

      var items = [1, 2, 3, 4, 5];

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.equal(tasks.length, items.length);
        cargo.stop();
        callback();
        done();
      }, items.length, 9000);

      setTimeout(function() {
        items.forEach(function(item) {
          cargo.push(item);
        });
      }, 1000);

      clock.tick(1000);

    });

    it('can have multiple instances running in parallel', function(done){

      var total1, total2;

      var cargo1 = asyncTimedCargo(function(tasks, callback) {
        total1 = tasks.length
        callback();
      }, 10, 300);

      var cargo2 = asyncTimedCargo(function(tasks, callback) {
        total2 = tasks.length
        callback();
      }, 10, 300);

      async.parallel({
        cargo1: function(callback) {
          setTimeout(function() {
            cargo1.push('1');
            callback(null, 1);
          }, 100);
        },
        cargo2: function(callback) {
          setTimeout(function() {
            cargo2.push('1');
            cargo2.push('2');
            callback(null, 2);
          }, 150);
        }
      }, function(err, results) {

        setTimeout(function() {
          assert.notEqual(cargo1, cargo2);
          assert.equal(total1, results.cargo1);
          assert.equal(total2, results.cargo2);
          done(err);
        }, 1000);

        clock.tick(1010);

      });

      clock.tick(310);

    });

  });

  describe('calls with callback', function() {

    it('it calls item callback after flush', function(done) {

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.equal(tasks.length, 1);
        cargo.stop();
        callback('err', 'arg');

      }, 1, 5000);

      cargo.push('ITEM', function(err, arg) {
        assert.equal(err, 'err');
        assert.equal(arg, 'arg');
        done();
      });

    });

  });

  describe('start/stop', function() {

    it('stop cancells timer', function(done) {

      var items = [1, 2, 3, 4, 5];

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.fail('should not be called');
      }, 100, 5000);

      items.forEach(function(item) {
        cargo.push(item);
      });

      cargo.stop();

      clock.tick(5000);

      setTimeout(function() {
        done();
      }, 1000);

      clock.tick(1000);
    });

    it('start resets timer', function(done) {

      var items = [1, 2, 3, 4, 5];

      var started = false;

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.isTrue(started);
        done();
      }, 100, 5000);

      items.forEach(function(item) {
        cargo.push(item);
      });

      cargo.stop();

      clock.tick(5000);

      cargo.start();
      started = true;

      clock.tick(5000);
    });

    it('running flag is true after start', function(done) {

      var items = [1, 2, 3, 4, 5];

      var cargo = asyncTimedCargo(function(tasks, callback) {
        done();
      }, 100, 5000);

      items.forEach(function(item) {
        cargo.push(item);
      });

      assert.isTrue(cargo.running());

      clock.tick(5000);
    });

    it('running flag is false after stop', function(done) {

      var items = [1, 2, 3, 4, 5];

      var cargo = asyncTimedCargo(function(tasks, callback) {
        done();
      }, 100, 5000);

      items.forEach(function(item) {
        cargo.push(item);
      });

      cargo.stop();

      assert.isFalse(cargo.running());

      cargo.process();

    });

    it('running flag is false when processing', function(done) {

      var items = [1, 2, 3, 4, 5];

      var cargo = asyncTimedCargo(function(tasks, callback) {
        assert.isFalse(cargo.running());
        done();
      }, 3, 5000);

      items.forEach(function(item) {
        cargo.push(item);
      });

    });

  });

});
