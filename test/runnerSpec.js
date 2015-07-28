var runner = require('../');

var chai = require('chai');
var darling = require('darlingjs');
var expect = chai.expect;
var Promise = require('bluebird');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('live on promise', () => {
  var step,
    resolve1,
    reject1,
    lastPromise1,
    resolve2,
    lastPromise2,
    lastPromise3;

  beforeEach(() => {
    lastPromise1 = new Promise((_resolve_, _reject_) => {
      resolve1 = _resolve_;
      reject1 = _reject_;
    });
    lastPromise2 = new Promise((_resolve_) => {
      resolve2 = _resolve_;
    });
    lastPromise3 = new Promise(() => {});

    step = sinon.stub();
    step
      .onFirstCall().returns(lastPromise1)
      .onSecondCall().returns(lastPromise2)
      .onThirdCall().returns(lastPromise3);
  });

  it('should return function', () => {
    expect(runner()).to.be.a('function');
  });

  it('should do not call step function until start is happened', (done) => {
    runner()(step)
      .start();

    expect(step).to.have.been.calledOnce;

    resolve1();

    Promise
      .delay(100)
      .then(function () {
        expect(step).to.have.been.calledTwice;
      })
      .then(resolve2)
      .delay(100)
      .then(function () {
        expect(step).to.have.been.calledThrice;
      })
      .then(done);
  });

  it('should stop runner on failed promise', (done) => {
    runner()(step)
      .start();

    expect(step).to.have.been.calledOnce;

    reject1();

    Promise
      .delay(100)
      .then(function () {
        expect(step).to.have.been.calledOnce;
      })
      .then(done);
  });

  it('should stop update on stop()', (done) => {
    var r = runner()(step).start();

    expect(step).to.have.been.calledOnce;

    resolve1();

    r.stop();

    Promise
      .delay(100)
      .then(function () {
        expect(step).to.not.have.been.calledTwice;
      })
      .then(done);
  });

  it('should auto start runner on option autostart = true', () => {
    runner({
      autostart: true
    })(step);

    expect(step).to.have.been.calledOnce;
  });

  describe('integrated', () => {
    it('should works for crowded world', (done) => {
      var handlerResolve1 = null;
      var handler = sinon.stub();

      handler.onFirstCall().returns(new Promise((_resolve_) => {
        handlerResolve1 = _resolve_;
      }));

      handler.onSecondCall().returns(new Promise((_resolve_) => {
        resolve2 = _resolve_;
      }));

      var w = darling.world()
        .pipe({
          async: true,
          updateAll: handler
        })
        .live(runner());

      w.entity({});
      w.start();

      Promise
        .delay(100)
        .then(() => {
          expect(handler).to.have.been.calledOnce;
        })
        .then(handlerResolve1)
        .delay(100)
        .then(() => {
          expect(handler).to.have.been.calledTwice;
        })
        .done(done);
    });

    it('should delay for empty world', (done) => {
      var handler = sinon.stub();

      handler.onFirstCall().returns(new Promise(() => {}));
      handler.onSecondCall().returns(new Promise(() => {}));

      var w = darling.world()
        .pipe({
          async: true,
          updateAll: handler
        })
        .live(runner({
          delayOnIdle: 100
        }));

      w.start();

      Promise
        .delay(100)
        .then(() => {
          expect(handler).to.not.have.been.calledOnce;
        })
        .delay(100)
        .then(() => {
          w.e({});
        })
        .delay(100)
        .then(() => {
          expect(handler).to.have.been.calledOnce;
        })
        .done(done);
    });

    it('should stop immediately on', (done) => {
      var handler1 = sinon.stub().returns(new Promise((_resolve_) => {
        resolve1 = _resolve_;
      }));
      var handler2 = sinon.stub().returns(new Promise(() => {}));
      stop({immediate: true})
      var w = darling.world()
        .pipe({
          async: true,
          tap: handler1
        })
        .pipe({
          async: true,
          tap: handler2
        })
        .live(runner({
          delayOnIdle: 100
        }));

      w.start();

      Promise
        .delay(100)
        .then(() => {
          expect(handler1).to.have.been.calledOnce;
        })
        .delay(100)
        .then(() => {
          w.stop({immediate: true});
          resolve1();
        })
        .delay(100)
        .then(() => {
          expect(handler1).to.have.been.calledOnce;
          expect(handler2).to.not.have.been.called;
        })
        .done(done);
    });
  });
});
