//implement simple Promise 
//1 Promise is a Function/class, need a executer for parameter
//2 resolve only handle PENDING=> FULFILLED
//3 reject  onle handle PENDING=> REJECTED
//4 then    return a new Promise instance, can chain call. if status is PENDING, need to save the fulfilled callback and the rejected callback 
//5 catch   same as p1.then(null, fn)
//6 all/race     tools for Promise type, not for instance, need promise array for parameter. 
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
const handleTargetPromise = function(promise2, result, resolve, reject) {
    //only x is error or x is a rejected promise, then the target promise will rejected.
    if(promise2 === result) {
        throw new TypeError('Chaining cycle detected for promise #<Promise>');
    }
    try {
        let then = result.then;
        if(typeof then === 'function') {
            then(value=> {
                resolve(value)
            }, reason=> {
                reject(reason)
            });
        } else {
            resolve(result);
        }
    } catch(error) {
        reject(error);
    }
}

const isPromise = function(promise) {
    return promise&&(typeof promise.then==='function') ? true : false;
}
class MyPromise {
    constructor(execu) {
        this.status = PENDING;//default status
        this.value;//fulfilled value
        this.reason;//rejected reason
        this.onFulfilledCallbacks = [];//the same one promise need to support mutiple then, if resolve or reject async, need to keep callbacks
        this.onRejectedCallbacks = [];        
        let resolve = value=> {
            if(this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.onFulfilledCallbacks.forEach(onFulfilledCallback=> {onFulfilledCallback(this.value);});         
            }
        };
        let reject = reason=> {
            if(this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                this.onRejectedCallbacks.forEach(onRejectedCallback=> {onRejectedCallback(this.reason)});
            }
        }
        this.then = function(onFulfilled, onRejected) {
            onFulfilled = typeof onFulfilled==='function' ? onFulfilled : val=>val;
            onRejected = typeof onRejected==='function' ? onRejected : err=> {throw err;};
            //need to support chain call 
            let promise2 = new MyPromise((resolve, reject)=> {
                if(this.status === PENDING) {
                    this.onFulfilledCallbacks.push(()=> {
                        setTimeout(()=> {
                            let value = onFulfilled(this.value);
                            handleTargetPromise(promise2, value, resolve, reject);
                        });            
                    });
                    this.onRejectedCallbacks.push(()=> {
                        setTimeout(()=> {
                            let reason = onRejected(this.reason);
                            handleTargetPromise(promise2, reason, resolve, reject);
                        });            
                    });
                }
                if(this.status === FULFILLED) {
                    setTimeout(()=> {
                        let value = onFulfilled(this.value);
                        handleTargetPromise(promise2, value, resolve, reject);
                    });
                }
                if(this.status === REJECTED) {
                    setTimeout(()=> {
                        let reason = onRejected(this.reason);
                        handleTargetPromise(promise2, reason, resolve, reject);
                    });
                }
            }); 
            return promise2;
        };
        //grammer suger for then.
        this.catch = function(errorHandle) {
            this.then(null, errorHandle);
        }
        execu(resolve, reject);
    }
}

//all are fulfilled then fulfilled, once one promise rejected then rejected
//return the result array, keep the promise order in the queue
MyPromise.all = function (promises) {
    let count = 0;
    return new MyPromise((resolve, reject)=> {
        let result = [];
        let resolveData = function(index, value) {
            result[index] = value;
            if(++count === promises.length) {
                resolve(result);
            }
        }
        for(let i=0, len=promises.length; i<len;i++) {
            let promise = promises[i];
            if(isPromise(promise)) {
                promise.then((value)=>{
                    resolveData(i, value);
                }, reject);
            } else {
                resolveData(i, promise);
            }
        }
    });
}

//one fulfilled then fulfilled one rejected then rejected
//return the result of fastest promise
MyPromise.race = function(promises) {
    let promise2 = new MyPromise((resolve,reject)=> {
        for(let i=0,len=promises.length;i<len;i++) {
            let promise = promises[i];
            if(isPromise(promise)) {
                promise.then(resolve,reject);
            } else {
                //because of promise.then is a async method, used setTimeout in it, so also use setTimeout here for no-promise object, so can keep the order. 
                setTimeout(()=>{
                    resolve(promise);
                });
            }
        }
    });
    return promise2;
}
MyPromise.deferred = function() {
    let dfd = {}
    dfd.promise = new MyPromise(function(resolve, reject) {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
}

module.exports = MyPromise;
