const async6 = require('async6');
const run = async6.run;

'use strict';

module.exports = {
	HapiAsync: HapiAsync,
	isNull: isNull,
	isEmpty: isEmpty,
	as: _as
};

// cast "primitive" types
function _as(val, type){
	return type(val);
}


// --------- Object Utils --------- //
var UD = "undefined";
var STR = "string";
var OBJ = "object";

// return true if value is null or undefined
function isNull(v){
	return (typeof v === UD || v === null);
}

// return true if the value is null, undefined, empty array or empty string
function isEmpty(v){
	if (isNull(v)){
		return true;
	}
	if (v instanceof Array || typeof v === STR){
		return (v.length === 0)?true:false;
	}

	if (typeof v === OBJ){
		// apparently 10x faster than Object.keys
		for (var x in v) { return false; }
		return true;
	}

	return false;
}
// --------- /Object Utils --------- //


// --------- HapiAsync Plugin --------- //
function HapiAsync(server, options, next){
	console.log("registering HapiSync");
	server.handler("async",asyncHandler);
	return next();
}

HapiAsync.attributes = {
	name: "HapiAsync",
	once: true,
	connections: false
};

function asyncHandler(route, options){
	const handler = (request, reply) => {
		var it = options(request, reply);
		run(it);
	};
	return handler;
}
// --------- /HapiAsync Plugin --------- //