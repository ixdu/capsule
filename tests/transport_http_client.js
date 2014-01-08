/* Test for capsule module - transport.http with transport.features.router
 * 
 */

var fs = require('fs');

var capsule = require('../platforms/nodejs/capsule.js');
var DEBUG = 1;

var modules = capsule.create();
with(modules){
    var transport_http = require('../modules/transport/http.js');

   var trans = transport_http.create({ 'url' : "http://localhost:8810/socket.js", 'method' : "POST" }, transport.features.client, modules);

   for(var ind = 0; ind < 5; ind++){
       trans.send('blah blah, tuk tuk lalala, hohoh, ya ya ya ga' + ind, function(msg){
		       console.log('hoi ', msg);
		   });
       
   }
}