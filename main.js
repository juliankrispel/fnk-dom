var fnk = {};

fnk.argsToArray = function(args){
    return Array.prototype.slice.call(args, 0);
};

fnk.dontCurry = ['argsToArray', 'getType', 'isType', 'curry', 'autoCurry', 'isTrue', 'compose', 'withArgs'];

fnk.getType = function(thing){
    if(thing === null)return "null"; // special case
    var string = Object.prototype.toString.call(thing);
    return string.substr(8, string.length - 9).toLowerCase();
};

fnk.isType = function(thing, name){
    return fnk.getType(thing) === name;
};

fnk.withArgs = function(func, args){
    return function(){
        return func.apply(this, fnk.argsToArray(args).concat(fnk.argsToArray(arguments)));
    };
};

fnk.curry = function(fn, args) {
    return function () {
        return fn.call(this, fnk.argsToArray(args).concat(fnk.argsToArray(arguments)));
    };
};

// So what does currying do
// Return a function until all arguments
// are fulfilled
fnk.autoCurry = function(fn, expected){ 
    expected = expected || fn.length;
    return function f() {
        var args = arguments;
        if(args.length >= expected){
            return fn.apply(this, args);
        }else{
            return fnk.withArgs(f, args);
        }
    };
};

fnk.isTrue = function(val){
    if(fnk.getType(val) === 'function'){
        return !!val();
    }else{
        return !!val;
    }
};

fnk.maybe = function(func, val){
    return function(){
        if(fnk.isTrue(val)){
            return func;
        }
    };
};

fnk.compose = function(){
    var fns = arguments;
    return function(){
        var args = arguments;
        fnk.forEach(function(fn){
            args = [fn.apply(this, args)];
        }, fnk.argsToArray(fns));
        return args[0];
    };
};

fnk.forEach = function(fn, obj){
    if(typeof obj.forEach === Array.prototype.forEach){
        obj.forEach(fn);
    }else{
        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                fn(obj[key], key);
            }
        }
    }
};

fnk.dot = function(member, obj){
    return obj[member];
};

fnk.map = function(fn, obj){
    var type = fnk.getType(obj);
    var result;
    if(type === 'array'){
        result = [];
    }else{
        result = {};
    }

    fnk.forEach(function(v, k){
        result[k] = fn(v, k);
    }, obj);
    return result;
};

fnk.mapKeyValuePairs = function(fn, obj){
    var result = {};
    fnk.forEach(function(v, k){
        var keyValuePair = fn(v, k);
        var key = keyValuePair[1] || k;
        result[key] = keyValuePair[0];
    }, obj);
    return result;
};

fnk.plusOne = function(num){
    return num + 1;
};

fnk.reduce = function(fn, obj){
    var result = 0;
    fnk.forEach(function(v, k){
        result = fn(result, v, k);
    }, obj);
    return result;
};

fnk.contains = function(obj, val){
    for (var i = 0; i < obj.length; i++){
        if(val === obj[i]){
            return true;
        }
    }
    return false;
};

fnk.div = function(fns, data, output){
    output = output = {};
    output.div = {};
    output.div = fnk.compose.apply(this, fns)(data, output.div);
    return output;
};

fnk.text = function(fns, data, output){
    output = output = {};
    output.text = fnk.compose.apply(this, fns)(data, output.div);
    return output;
};

fnk = fnk.map(function(v, k){
    if(fnk.getType(v) === 'function' && !fnk.contains(fnk.dontCurry, k)){
        return fnk.autoCurry(v);
    }else{
        return v;
    }
}, fnk);
// Input
var data = { 'name': 'Julian', friends: ['Marco', 'Linda', 'Sepp'] };

// Output
var output = {'div': { content: 'Julian', children: {'ul': {'li': ['Marco', 'Linda', 'Sepp'] }} }};
var t = fnk.text([]);

var app = fnk.div(
        [fnk.text([fnk.dot('name')])], 
        data, 
        {});
console.log(app);
