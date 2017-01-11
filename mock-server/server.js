'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const exec = require( 'child_process' ).exec;

const HapiAsync = require('./utils.js').HapiAsync;

const run = require('async6').run;

var isWin = /^win/.test( process.platform );

// Default app config. 
// Depending on the properties, it will be used for the connection properties or 
var defaultCfg = {
	//host: 'localhost',    // connection host (if we do this only does not work when deployed)
	port: 8080,			    // connection port
	clientRoot: process.cwd() + '/web/', // root of the client files (which will be served statically)	
	routes: { cors: 
						{origin: ['*'], 
							additionalHeaders: ["Accept-language"]
						}
	}
};

// App is a simple convenience Hapi/Server wrapper. 
class Server{
	
	constructor(){
	}

	init(cfg){

		this.cfg = Object.assign({},defaultCfg,cfg);

		function* _init(){
			console.log("___init");
			yield initServer.call(this);
		}	

		return run(_init.call(this));

	}

	// Load an extension for this application. 
	// An extension can contains a list routes extension.routes = [] 
	// and eventually (not yet) extension.exts = [] 
	// A extension is usually loaded from 
	load(routes){
		if (typeof routes === 'undefined' || !(routes instanceof Array)){
			throw new Error("App - cannot load routes " + routes);
		}		
		for (var route of routes){
			this.hapiServer.route(route);
		}
	}

	start(){
		// Start the server
		var self = this;
		self.hapiServer.start((err) => {

			if (err) {
				throw err;
			}

			// open browser
			if( isWin ){
				exec( 'start http://localhost:' + self.cfg.port, function( error, stdout, stderr ){});
			}else{
				exec( 'open http://localhost:' + self.cfg.port, function( error, stdout, stderr ){});
			}

			console.log('Server running at:', self.hapiServer.info.uri);
		});	
	}	
}

// --------- App Private Methods --------- //
function initServer(){
	var self = this;
	this.hapiServer = new Hapi.Server();

	// register plugins
	this.hapiServer.register(HapiAsync, function() {});
	this.hapiServer.register(Inert, function () {});		
	
	// start server
	this.hapiServer.connection({host: this.cfg.host, port: this.cfg.port});		

	// Bind static files to Inert plugin
	this.hapiServer.route({
		method: '*',
		path: '/{path*}',
		handler: {
			directory: {
				path: function( request ){
					console.log( ' > ' + new Date().getTime() + ' ' + request.method.toUpperCase() + ' ' + request.path );
					return self.cfg.clientRoot;
				},
				listing: true,
				index: [ 'index.html', 'default.html' ]
			}
		}
	});

	// bind APIs
	// this.load(require('./api/api-spherechart.js'));
	// this.load(require('./api/api-dashpanel.js'));		
	// this.load(require('./api/api-cruds.js'));
	// this.load(require('./api/api-volumes.js'));	
	// this.load(require('./api/api-shares.js'));

}
// --------- /App Private Methods --------- //

module.exports = new Server();