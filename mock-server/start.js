var server = require('./server.js');

server.init().then(function(){
	server.start();
});