This is a simple todoMVC remastered with MVDOM framework and some of the simple but scalable best practices. 

Note: This is in early development right now. We will add more soon. 


## To run the application

```
# clone the server
git clone git@github.com:mvdom/todoMVC.git

# go to folder
cd todoMVC

# Intall the node components
npm install

# Compile the application
gulp

# Start 
```

Assumption: Node.js 6.x need to be installed, as well as gulp as global module (`npm install -g gulp`) 

## Best Practices

#### Code Structure 

While todoMVC is a very simple demo application the code structure has been designed to start simple and scale very effectively. The assumption of this code structure is that this project will be a front-end development with a mock-server intended to just server the pages and mimic real server API.

- [/src](/src) for all client side source code that needs to be 'compiled' (e.g., .js, .pcss, and handlebars .tmpl templates.
    + [/src/js-app/](/src/js-app/) are all of the common application source code (i.e. accross multiple views). 
    + [/src/js-lib](/src/js-lib) for all of the 3rd party libraries. The best practice followed is that 3rd party libraries are included in the global scope (see [/src/js-lib/index.js])
    + [/pcss/](/pcss/) are all of the common style for the application and cross view component elements.
    + [/src/view/](/src/view) (*.js, *.pcss, *.tmpl) are all of the "view" assets, from javascript view controller, postcss view styles, and handlebars view template(s) (*.tmpl) .
- [/web](/web) Web client folder containing all the compiled .js/.css files from `/src/` and other "static" web front-end assets such as fonts, images, svgs, ...
- [/mock-server](/mock-server)  contains the node.js mock server code (using Hapi) which is targeted to be the simplest/minimum code to replicated web API of a real server or system (i.e. no performance consideration, just compliance with real system interfaces)
- [package.json](package.json) the node js package file with key "start" script. 
    + `npm start` to start the browser on port 8080, and launch the browser to `http://localhost:8080/`
- [gulpfile.js](gulpfile.js) with the new main task:
    - `gulp` to clean and process all of the files, and making the `/web/` folder deployable (i.e. copy/paste to the appropriate test/stage/production server)
    - `gulp watch` to watch the [/src/](/src/) folder and keep the [/web/](/web/) folder deployable and the application reloadable in the browser. 


#### DOM Centric Approach

The DOM Centric approach consists of using the DOM as a MVC foundation to build simple but scalable HTML application. 

Here are the key concepts of this approach:

- Distinguish composite components (i.e., Views) that often require a full asynchronous lifcycle management from smaller UI component elements that can have their behavior (.js) decoupled from their rendering, that can have their rendering fully decoupled from their behavior. 
- Embrace DOM UI Event model for View and Component Element communication.
- Adopt a simple pub/sub model (e.g., mvdom.hub) for all other non-UI component and layer communication (e.g, mvdom.hub("dsHub") for data services), and allow Views to simply subscribe and unsubscribe to such events. 
- Favor distributed source/feature discovery or module registry model over centralized dictionary (e.g., avoid centralized routing file or modules index.js file). 
- Adopt a simple and well defined naming convention to enable clear component scoping in Javascript, Templating, and Styling. 
- Adopt a DOM Centric Data Referencing approach by embedding data reference in the outermost DOM element of each entity, allowing to avoid complex UI/Model binding infrastructure. 


#### Views model & naming convention

- Views are the main UI parts of the application that need to have a full lifecycle (create, init, postDisplay, destroy). Views can also be described as composite components, and are generally panels, dialogs, and feature content areas.  
- Each View has the following three js, pcss, and tmpl files CamelCase named. For example, for the view `MainView` we have the following:
    + [/src/view/MainView.js](/src/view/ViewName.js) for the controller (using the mvdom view cycle management)
    + [/src/view/MainView.pcss](/src/view/MainView.pcss) the postcss file for this compnoent, using the name of the view as the top nested "postcss" scope. 
    + [/src/view/MainView.tmpl](/src/view/MainView.tmpl) one or more templates for this given view. By default, file name is the template name, for multiple template per file, use  `<script id="ViewName-item-template" type="text/html">`. 
- All View controllers must have a `.create` method like 

```js
mvdom.register("MainView",{
    create: function(data, config){
        return render("MainView");
    },
    ...
});
```


#### Simple render method

[/src/js-app/render.js](/src/js-app/render.js) is a simple handlebars render method, which gives a simple and extensible point for all application code o 

```js
render(templateName, data);
```

Recommendation: It is usually a good idea to wrap 3rd party libraries in simple and application centric APIs. The goal is to expose just what is needed and in a application centric way. 

#### DOM Centric data referencing 

The DOM Centric data referencing approach consists in putting data reference information (e.g. entity type and id) in the DOM element data-* attributes for future need. It seems to almost be too simple to be scalable (with application complexity), but actually reduce 

In our case the `todo-item` is the outter most element, and we will put the following data-... as

```html
<div class="todo-item {{echo done 'todo-done'}}" data-entity="Todo" data-entity-id="{{id}}">
```
See code at [/src/view/TodosCard.tmpl](/src/view/TodosCard.tmpl)

Then, we have a generic utility method, in `js-app/utils.js` which allow to get the first outter DOM element with the matching entity and return a `{id, type, el}` javascript object. 

```js
events{
        "click; .ctrl-check": function(evt){
            var entityRef = utils.entityRef(evt.target, "Task");
            // we toggle the done value (yes, from the UI state, as this is what the user intent)
            var done = !entityRef.el.classList.contains("task-done");
            ds.update("Task",entityRef.id, {done:done});            
        }
}
```
see code at [/src/view/TodosCard.js](/src/view/TodosCard.js)

So, very easily, when click on the check element, we can get find and extract from the outter most DOM element for Task, the `.id` the `.type` (which will be "Task" as this is what we are matching) and the ".el" which should be the element. The ".el" is the outter most element for this entity, and is where we should store additional entity states as classnames if needed (in this case, we store and use the "task-done" states). 

#### Simple Handlebars helper `{{echo}}`

One of the thing we often need in a template is to print some text if a property is true (and empty if not). This is specially useful for class names. We have developed the ```{{echo cond val}}``` handlebars, see [/src/js-app/handlebars-helpers.js](/src/js-app/handlebars-helpers.js) and the [/src/view/TodosCard.tmpl](/src/view/TodosCard.tmpl) for usage. 

#### Use CSS states

Note that we have the state of the "Todo" element at the outter most element, which is the `.todo-item` div, so that we can avoid any redundancy. The cascading nature of CSS allow us to easily support this pattern. 

```css
.TodosCard{
    ...
        .todo-item{

            &.todo-done{ /* here the ".todo-done" class will be in the Todo outermost DOM element */
                .ctrl-check{
                    background-color: green;
                    ...
                }
            }
        }
```

see [/src/view/TodosCard.pcss](/src/view/TodosCard.pcss)

