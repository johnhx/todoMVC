var d = mvdom; 

// for now empty
module.exports = {
	entityRef: entityRef
};


// --------- Util APIs --------- //
/**
Look for the closest (up) dom element that have a matching "data-entity" attribute and return 
the reference of the entitye {id, type, el}

- @param el: the element to start the search from (it will be inclusive)
- @param type: (optional) the value of the "data-entity" to be match with. 
               If absent, will return the first element that have a 'data-entity'.

- @return {type, id, el}, where .type will be the 'data-entity', .id the 'data-entity-id' (as number), 
                        	and .el the dom element that contain those attributes
*/
function entityRef(el, type){
	var selector = (type != null)?("[data-entity='" + type + "']"):"[data-entity]";
	var entityEl = d.closest(el,selector);
	if (entityEl){
		var entity = {};
		entity.el = entityEl;
		entity.type = entityEl.getAttribute("data-entity");
		entity.id = entityEl.getAttribute("data-entity-id") * 1; // make it a number
		return entity;
	}
	return null;
}
// --------- Util APIs --------- //