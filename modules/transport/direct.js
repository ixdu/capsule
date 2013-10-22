var transport = require('../transport.js');
var callbacks = new Array();

exports.create = function(address, features){
    callbacks[address] = new Array();
    if(features & transport.features.router){
        return {
	    address : address,
	    on_msg : function (msg_id, callback){
		callbacks[address]["r" + msg_id] = callback;
	    },
	    send : function(msg_id, msg_body, callback){
		if(callbacks[address]["d" + msg_id])
		    callbacks[address]["d" + msg_id](msg_id,msg_body);
		else console.log("Callback on", msg_id, "is not setted")
		if(callback != null)
		    callbacks[address]["r" + msg_id] = callback;
	    },
	    destroy : function(){}
	}		    
    }else if (features & transport.features.dealer){
	return {
	    address : address,
	    on_msg : function (msg_id, callback){
		callbacks[address]["d" + msg_id] = callback;
	    },
	    send : function(msg_id, msg_body, callback){
		if(callbacks)[address]["r" + msg_id])
	    calllbacks[address]["r" + msg_id](msg_id,msg_body);
	    else console.log("Callback on", msg_id, "is not setted")
	    if(callback != null)
		callbacks[address]["d" + msg_id] = callback;
	},
	destroy : function(){}	
    }
}