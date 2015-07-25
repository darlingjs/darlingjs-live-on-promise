var runner = require('../');

var chai = require('chai');
var expect = chai.expect;
var Promise = require('bluebird');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('live on promise', function() {
  var step,
    resolve1,
    reject1,
    lastPromise1,
    resolve2,
    lastPromise2,
    lastPromise3;

  beforeEach(function() {
    lastPromise1 = new Promise(function(_resolve_, _reject_) {
      resolve1 = _resolve_;
      reject1 = _reject_;
    });
    lastPromise2 = new Promise(function(_resolve_) {
      resolve2 = _resolve_;
    });
    lastPromise3 = new Promise(function() {});

    step = sinon.stub();
    step
      .onFirstCall().returns(lastPromise1)
      .onSecondCall().returns(lastPromise2)
      .onThirdCall().returns(lastPromise3);
  });

  it('should return function', function() {
    expect(runner()).to.be.a('function');
  });

  it('should do not call step function until start is happened', function(done) {
    runner()(step)
      .start();

    expect(step).to.have.been.calledOnce;

    resolve1();

    Promise
      .delay(100)
      .then(function() {
        expect(step).to.have.been.calledTwice;
      })
      .then(resolve2)
      .delay(100)
      .then(function() {
        expect(step).to.have.been.calledThrice;
      })
      .then(done);
  });

  it('should stop runner on failed promise', function(done) {
    runner()(step)
      .start();

    expect(step).to.have.been.calledOnce;

    reject1();

    Promise
      .delay(100)
      .then(function() {
        expect(step).to.have.been.calledOnce;
      })
      .then(done);
  });

  it('should stop update on stop()', function(done) {
    var r = runner()(step).start();

    expect(step).to.have.been.calledOnce;

    resolve1();

    r.stop();

    Promise
      .delay(100)
      .then(function() {
        expect(step).to.not.have.been.calledTwice;
      })
      .then(done);
  });

  it('should auto start runner on option autostart = true', function() {
    runner({
      autostart: true
    })(step);

    expect(step).to.have.been.calledOnce;
  });
});
