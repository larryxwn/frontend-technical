const proxy = function(fn, successFn, ...args) {
    let item = successFn ? successFn.name : fn.name;
    furion.start(item);
    fn(...args);
    if(!successFn) {
        furion.end(fn.name);
    }
}

const proxyAsync = function(fn,...args) {
    fn(...args);
    furion.end(fn.name);
}
