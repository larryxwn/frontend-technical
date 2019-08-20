//install promises-aplus-tests for testing if promise is follow the Promise A+ rule.

//step1: need to add the follow logic
MyPromise.deferred = function() {
    let dfd = {}
    dfd.promise = new MyPromise(function(resolve, reject) {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
}

module.exports = MyPromise;

//step2: global install promises-aplus-tests
npm i promises-aplus-tests -g
promises-aplus-tests myPromise.js
