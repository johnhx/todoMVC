var d = mvdom; // global lib dependency


/*
	"ds" is a client data service that perform all of the 
	CRUD operation on the core data objects. 

	- All APIs are Promise based
	- When connected to the server, uses the app.do[REST] ajax methods
	
	Note: Currently this dataservice use a local inmemory datastore (see below)
*/
module.exports = {
	create: create, 
	get: get,
	update: update, 	
	list: list,
	first: first,
	"delete": remove
}

// --------- Public API --------- //
function create(type, entity){
	return new Promise(function(resolve, reject){

		// get the next seq and put the new object
		var id = store.nextSeq();
		store.put(type, id, entity);

		// get the new entity from the store (will have the .id)
		entity = store.get(type, id);
		// we resolve first, to allow the caller to do something before the event happen
		resolve(entity);

		// we publish the dataservice event
		d.hub("dsHub").pub(type,"create",entity);
	});
}

function update(type, id, entity){
	return new Promise(function(resolve, reject){
		var dbEntity = store.get(type, id);
		if (dbEntity){
			//make sure we do not change the .id
			delete entity.id;

			// put the new entity properties in the dbEntity
			Object.assign(dbEntity, entity);
			store.put(type,id, dbEntity);

			// we resolve 
			resolve(dbEntity);

			// we public the dataservice event
			d.hub("dsHub").pub(type,"update", dbEntity);

		}else{
			reject("Cannot update entity " + type + " because [" + id + "] not found");
		}
	})
}

function get(type, id){
	return new Promise(function(resolve, reject){
		return store.get(type);
	});
}

function list(type, filter){
	// TODO: need to add the filtering support
	return new Promise(function(resolve, reject){
		resolve(store.all(type));	
	})
	
}

function first(type, filter){
	// TODO: need to be implemented
}

function remove(type, id){
	return new Promise(function(resolve, reject){
		resolve(store.remove(type, id));

		// we publish the dataservice event
		d.hub("dsHub").pub(type,"delete",id);		
	})
}
// --------- /Public API --------- //


// --------- Local Mock Store --------- //
/*
	A very simple in-memory local store. 
*/

// The allStore is of format {objectType : {id: entity, ....}}
var allStore = {};
var seq = 1; // global sequence

var store = {
	nextSeq: function(){
		return seq++;
	},

	get: function(type, id){
		var entityStore = allStore[type];
		return (entityStore)?Object.assign({},entityStore[id]):null
	}, 

	put: function(type, id, entity){
		var entityStore = ensureObject(allStore,type);
		if (entityStore){
			var dbEntity = Object.assign({}, entity);
			dbEntity.id = id;
			entityStore[id] = dbEntity; 
			return true;
		}
		return false;
	}, 

	remove: function(type, id){
		var entityStore = allStore[type];
		if (entityStore && entityStore[id]){
			delete entityStore[id];
			return true;
		}
		return false;		
	}, 

	all: function(type){
		var list = [];
		var entityStore = allStore[type];
		if (entityStore){
			for (var id in entityStore){
				list.push(Object.assign({}, entityStore[id]));
			}
		}
		return list;
	}

}

// --------- /Local Mock Store --------- //


function ensureObject(root, name){
	var obj = root[name];
	if (!obj){
		obj = {};
		root[name] = obj;
	}
	return obj;
}
