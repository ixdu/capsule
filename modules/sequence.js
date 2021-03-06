var serializer = require('../dependencies/serializer.js'),
    error = require('../parts/error.js'),
    sconfig = {
	realFunctions : true,
	includeFunctions : true
    };

function do_args(args, stack){
    for(ind in args){
	if(typeof(args[ind]) == 'string'){
	    var result;
	    if((result = /stack[.]*\[*(\w+)\]*\[*(\d*)\]*/.exec(args[ind]))){
		if(result.length == 2)
		    args[ind] = stack[result[1]];
		else if(result.length == 3)
		args[ind] = stack[result[1]][result[2]];
	    }
	}
    }
}

//calling local function with callback
function function_with_cb_do(action, name, stack, next){
    var func = action.shift();
    do_args(action, stack);

    action[action.length] = function(){
	if(name)
	    stack[name] = arguments;
	sprout(next, stack);	
    };

    func.apply(null, action);
}

//passing message to service
function service_do(action, name, stack, next){
    var service = action.shift();

//    do_args(action, stack);

    action.unshift({"stack" : stack,
		    "name" : name,
		 "next" : next});
    exports.mq_send(service, action);
    //further working with sprout doin inside service_loader
}

//calling function
function function_do(action, stack, next){
 //   console.log("far function elem is: " + elem);
    var func = action.shift();
    
    if(!func(exports, stack))
       sprout(next, stack);
}

function element_do(element, stack){
    if(typeof(element) != 'object' || element == null)
	return new error('element is incorrect', JSON.stringify(element));

    if(!element.hasOwnProperty('action'))
	return new error('element has no action property', JSON.stringify(element));

    var action =  element.action;
    var next = element.hasOwnProperty('next') ? element.next : [];
    var name = element.hasOwnProperty('name') ? element.name : 0;

    if(!action.length)
	return new error("element\'s action field is empty", JSON.stringify(element.action));	

    var type = action.shift();

    switch(type){
	// function with callback on last argument
    case 'c' : 
	function_with_cb_do(action, name, stack, next);
	break;
	
	//adapter
    case 'a':
	break;

	//message to service
    case 's' :
	service_do(action, name, stack, next);
	break;

	//function far. function which is executed in same place as element before
    case 'f' : 
	function_do(action, stack, next);
	break;
    }    
    
    return true;
}

function sprout(sprout, stack){
    sprout = serializer.serialize(sprout , sconfig);
    sprout = eval(sprout);

    if(typeof(stack) === 'undefined')
	stack = [];

    for(element in sprout){
	var ret = element_do(sprout[element], stack);
	if(ret instanceof error){
	    error.msg = '[in ' + element + 'scope]' + error.msg;
	}	
    }

    return true;    
};

exports.mq_send = function(){};

//low level api

exports.run = sprout;


//high level api

function element(type){
    return function(){
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift(type);
	return {
	    action : args,

	    sprout : function(){
		if(!this.hasOwnProperty('next'))
		    this.next = [];
		for(arg in arguments){
		    if(arguments[arg] instanceof Array)
			this.next = this.next.concat(arguments[arg]); //merging with low level sprout
		    else
			this.next.push(arguments[arg]);
		}
		return this;    
	    },
	    run : function(stack){
		return sprout([this], stack);
	    }
	};
    };
}

exports.msg = element('s');

exports.f = element('f');

exports.c = element('c');
