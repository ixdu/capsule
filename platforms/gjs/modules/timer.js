var GLib = imports.gi.GLib;

exports.create = function(callback, milisec, cyclic){
    if(cyclic){	
	var id = GLib.SOURCE_CONTINUE;
	id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, milisec, function(){
				  callback();
				  return id;
			      });
	return {
	    destroy : function(){
		id = GLib.SOURCE_REMOVE;
	    }
	};
    }else
	GLib.timeout_add(GLib.PRIORITY_DEFAULT, milisec, function(){
			     callback(); 
			     return GLib.SOURCE_REMOVE;
			 });	
    return null;  
};