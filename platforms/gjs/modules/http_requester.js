const Soup = imports.gi.Soup;
//const Lang = imports.gi.Lang;

var _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

function request(){
    var _req,
        _on_recv,
        _on_close,
        _on_error,
        _context;

    this.open = function(context){
	_context = context;
	_req = Soup.Message.new(context.method, context.url);
	_req.connect('finished', _on_close);
    };

    this.send = function(data){
	if(_context.method == 'POST')
	    _req.set_request('text/json', 2, data, data.length);
	_httpSession.queue_message(_req, 
				   function(_httpSession, message) {
				      _on_recv(message['response-body'].data);
				       _httpSession.cancel_message(_req, 1);
				      _req.finished();
				      _on_close();
				   });
    };

    this.close = function(){
	_on_close();
	_httpSession.cancel_message(_req, 1);
	_req.finished();
    };

    this.on_recv = function(cb){
	_on_recv = cb;
    };

    this.on_close = function(cb){
	_on_close = cb;
    };

    this.on_error = function(cb){
	_on_error = cb;
    };
}

exports.send = function(context, data, recv_cb, closed_cb, error_cb){
    var _request = new request();
    _request.send_once(context, data, recv_cb, closed_cb, error_cb);
}

exports.create = function(){
    return new request();
}