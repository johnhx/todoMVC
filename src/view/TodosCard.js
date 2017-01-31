var d = mvdom; // external lib
var render = require("../js-app/render.js").render;
var ds = require("../js-app/ds.js");
var u = require("../js-app/utils.js");

d.register("TodosCard",{
	create: function(data, config){
		return render("TodosCard");
	}, 

	postDisplay: function(){
		var view = this;

		view.newTodoIpt = d.first(view.el, "header .new-todo");
		view.newTodoIpt.focus();
		
		// --------- UI Debug --------- //
		// create couple of todo
		// ds.create("Todo",{subject:"test 1"});
		// ds.create("Todo",{subject:"test 2"});

		// edit the first element
		// setTimeout(function(){			
		// 	d.first(".todo-item label").dispatchEvent(new MouseEvent("dblclick", 
		// 		{
		// 			bubbles: true,
		// 			cancelable: true
		// 		}));
		// }, 100);	
		// --------- /UI Debug --------- //
	},

	events: {

		// all input - we disable the default Tab UI event handling, as it will be custom
		"keydown; input": function(evt){
			if (evt.key === "Tab"){
				evt.preventDefault();
			}
		}, 

		// --------- new todo UI Events --------- //
		// Handle the keyup on the input new-todo 
		// enter to create new, and tab to go to first item in the list.
		"keyup; input.new-todo": function(evt){
			var view = this;
			var inputEl = evt.target;

			// press enter
			if (evt.key === "Enter"){
				var val = inputEl.value;
				ds.create("Todo",{subject: val}).then(function(){
					inputEl.value = "";
				});
			}
			// press tab, make editable the first item in the list
			else if (evt.key === "Tab"){
				var todoEntityRef = u.entityRef(d.first(view.el, ".items .todo-item"));
				if (todoEntityRef){
					editTodo.call(view, todoEntityRef);
				}
			}
		}, 		


		// --------- /new todo UI Events --------- //



		// --------- todo-item UI Events --------- //
		// toggle check status
		"click; .ctrl-check": function(evt){
			var entityRef = u.entityRef(evt.target, "Todo");

			// we toggle the done value (yes, from the UI state, as this is what the user intent)
			var done = !entityRef.el.classList.contains("todo-done");

			// we update the todo vas the dataservice API. 
			ds.update("Todo",entityRef.id, {done:done});			
		}, 

		// double clicking on a label makes it editable
		"dblclick; label": function(evt){			
			editTodo.call(this, u.entityRef(evt.target, "Todo"));
		}, 

		// when the todo-item input get focus out (we cancel by default)
		"focusout; .todo-item input": function(evt){
			var view = this;
			var entityRef = u.entityRef(evt.target, "Todo");

			// IMPORTANT: Here we check if the entityEl state is editing, if not we do nothing. 
			//            Ohterwise, we might do the remove inputEl twice with the blur event flow of this element.
			if (entityRef.el.classList.contains("editing")){
				cancelEditing.call(view, entityRef);	
			}			
		}, 

		// when user type enter or tab in the todo-item input
		"keyup; .todo-item input": function(evt){
			var view = this;
			var inputEl = evt.target;
			var entityRef = u.entityRef(inputEl, "Todo");

			switch(evt.key){
			case "Enter":
				commitEditing.call(view, entityRef);
				break;

			case "Tab":					
				commitEditing.call(view, entityRef).then(function(){
					var entityEl = d.first(view.el, ".items .todo-item[data-entity-id='" + entityRef.id + "']");
					var siblingTodoEl = (evt.shiftKey)?d.prev(entityEl,".todo-item"):d.next(entityEl,".todo-item");
					if (siblingTodoEl){
						var siblingTodoRef = u.entityRef(siblingTodoEl, "Todo");	
						editTodo.call(this, siblingTodoRef);
					}else{
						// todo: need to focus on the first new-todo
						view.newTodoIpt.focus();
					}
				});
				break;
			}
		}
		// --------- /todo-item UI Events --------- //


	}, 

	hubEvents: {
		"dsHub; Todo": function(data,info){				
			refreshList.call(this);
		}
	}
});

// private: commit the the .todo-item pointed by entityRef.el if needed and remove the editing steps
// @return: return a Promise of when it will be done. 
function commitEditing(entityRef){
	return new Promise(function(resolve, fail){
		// Get the name/value of the elements marked by class="dx"
		var data = d.pull(entityRef.el);		

		// if the newSubject (in the input) is different, then, we update.
		if (data.subject !== data.newSubject){
			ds.update("Todo", entityRef.id, {subject: data.newSubject}).then(function(){
				// NOTE: no need to remove the editing state as the list will be rebuilt. 
				resolve();	
			});
		}
		// we cancel the editing (avoiding to do an uncessary update)
		else{
			cancelEditing.call(this,entityRef).then(function(){
				resolve();
			});
		}

	});
}

function cancelEditing(entityRef){
	return new Promise(function(resolve, fail){
		// remove the editing class
		entityRef.el.classList.remove("editing");

		// we can remove the input element
		var inputEl = d.first(entityRef.el, "input");
		inputEl.parentNode.removeChild(inputEl);
		return resolve();
	});
}


function editTodo(entityRef){
	var todoEl = entityRef.el;

	var labelEl = d.first(todoEl, "label");
	var currentSubject = labelEl.innerHTML;

	todoEl.classList.add("editing");

	// create the input HTML and add it to the entity element
	var inputHTML = render("TodosCard-input-edit", {subject: currentSubject});
	todoEl.insertAdjacentHTML("beforeend", inputHTML);

	// set the focus and selection on the input element
	var inputEl = d.first(todoEl, "input");
	inputEl.focus();
	inputEl.setSelectionRange(0, inputHTML.length);
}


// private: refrensh the todo list of items
function refreshList(){
	var view = this;
	ds.list("Todo").then(function(todos){
		var html = render("TodosCard-todo-items",{items:todos});
		d.first(view.el,".items").innerHTML = html;
	});	
}