//Template class for Noodles
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
}
	
define(function(require, exports, module){
/**--Noodles--
description: Noodles modules
*/
var Utilities = require('./utilities'),
	_String = require('./string').String,
	_Object = require('./object').Object,
	Context = require('./context').Context;
/**--module--
name: BrowserEnvironment
description: Browser Environment boolean
@type{boolean}
*/	
var BrowserEnvironment = typeof process === "undefined";
/**--module--
name:corePlugins
description: list of core module handlers
@type{array}
*/
var corePlugins = ['iftag','settag','looptag']
/**--module--
name:allPlugins
description: object of core module handlers
@type{object}
*/
var allPlugins = {};
/**--Noodles--
name:Template
description: Template Class
@param {object}
@param {Noodles.Template}
@return {Template}
*/
var _Template = exports.Template = function(objArg,Template){
	this._rawString = objArg.rawString;
	this._stringCache = objArg.rawString;
	this._document = [];
	this._leftCount = 0;
	this._warnings = [];
	this._metaData = {};
	this._needs = {};
	this._master = false;
	this._tagDelegation = {};
	this._lineOffset = objArg.lineOffset || 0;
	var metaData = objArg.metaData
	if(typeof metaData !== 'undefined'){
		this._id = 'master-' + Date.now();
		this._plugins = corePlugins.slice();
		var metaArr = metaData.split(/\n+/),
			i = metaArr.length,
			reMeta = /([^=]+)(={1})(.*)/,
			meta,name,value,keys,l;
		while(i--){
			if(/^\s+$/.test(metaArr[i])) continue;
			meta = reMeta.exec(metaArr[i].trim());
			name = meta[1].toLowerCase().trim();
			value = meta[3].trim();
			if(_Object.reIdentifier.test(name) && meta[2] === '='){
				if(name === "plugins"){
					this._plugins = this.plugins.concat(value.toLowerCase().split(','));
					continue;
				}
				this._metaData[name] = new _Template({rawString:value},this);
			}
		}
		this._master = true;
		this.onFinishCompiling = objArg.onFinishCompiling;
		_registerPlugins.call(this);
	}
	else if(typeof Template !== "undefined" && Template instanceof _Template){
		this._plugins = Template._plugins.slice();
		_registerPlugins.call(this);
	}
	
};
/**--module--
name:_startCreate - private method
description: starts the creation process
*/
var _startCreate = function(){
	this._templating = true;
	while(this._templating){
		_create.call(this);
	}
	if(this._master){
		this.onFinishCompiling(this);
		delete this.onFinishedCompiling;
	}
}
/**--module--
name:_create - private method
description: creates the document list of the Template Class
*/
var _create = function(){
	var leftIndex = this._rawString.indexOf('<{'),
        rightIndex = this._rawString.indexOf('}>'),
		expression,tag,lineStart,tagSplit;
		
	if(leftIndex > -1){
		
		this._leftCount++;
		if(rightIndex > -1){
			expression = this._rawString.slice(leftIndex + 2, rightIndex);
			this._document.push( new _String(this, this._rawString.slice(0,leftIndex) ) );
            this._rawString = this._rawString.slice(rightIndex + 2);
			if(expression.charAt(0) === ' '){ 
				Utilities.warning(this,'Invalid whitespace at the start of expression');
			}
			else{
				tag = expression.split(' ')[0].toLowerCase();
				lineStart = Utilities.getLineCount(this);
				tagSplit = tag.split('.')[0];
				expression = typeof allPlugins[this._tagDelegation[tagSplit]] !== "undefined" ? allPlugins[this._tagDelegation[tagSplit]].handleToken(this, expression, tag) : Utilities.parseType(this, expression);
				
				if(typeof expression.skip === "undefined" || expression.skip === false){
					
					expression.lineStart = lineStart;
					this._document.push(expression);
					expression.needs = expression.needs || {};
					
				}
			}
		}
		else{
			this._rawString = this._rawString.slice(leftIndex + 2);
			Utilities.warning(this,'Open ended expression');
		}
	}
	else{
		if(this._rawString.length > 0){
			this._document.push(new _String(this, this._rawString ));
		}
		this._documentLength = this._document.length;
		delete this._rawString;
		tag = Utilities.stringOnly(this._document);
		if(tag.stringOnly){
			this._stringOnly = true;
			this._document = [new _String(this,tag.string)];
			this._documentLength = 1;
			this.needs = {};
		}
		this._templating = false;
		_createExecutionOrder.call(this,this._master);
	}
};
/**--module--
name:_createExecutionOrder - private method
description: creates the execution order for a template based on its needs.
@param{boolean}
*/
var _createExecutionOrder = function(master){
	_reduceNeeds.call(this,master);
	//Rules for out of order execution:
	//Goal: We want to get anything that is ambiguous or requires a callback
	//to execute ASAP because they will be our bottlenecks.
	//Ambiguity means that we don't know if the element will affect anything after it,
	// so it's safest to assume that it will affect everything after it.
	//Something that needs a callback is an element that either has a lot of
	//	process time around it and so should tell the template to wait for it.
	//	Or, it is something that needs to make a call to another service, and will,
	//	itself, be idling for a response, that the template needs.
	//We want to execute or callbacks, stop processing, and wait for them to get back to us. 
	//1. Anything that modifies or sets something needs to execute in
	//	order against anything that needs that thing (go it! :).
	//2. Anything that is ambiguous acts as a break point, nothing after it
	//	can render until it's done, ambiguity trumps callbacks. But
	//	ambiguous things can have callbacks.
	//3. Anything that doesn't need anything can render at anytime, but,
	//	ideally, should render as close to the order it is in, when possible.
	//Note: Contrary to intuition, going in order is actually ideal, save for
	// our bottlenecks, because the more we can do in order the more we
	// can buffer to the server in the appropriate order.
	this._executionOrders = [];
	this._inAlready = {};
	var i = this.callBackDocs.length,
		index,l;
	//figure ambiguity out
	while(i--){
		if(this._inAlready[index.toString()]) continue;
		this._executionOrders.unshift([]);
		index = this.callBackDocs[i];
		this._inAlready[index.toString()] = true;
		_orderNeedsByObject.call(this,index);
		this._executionOrders[0].push(index);
	}
	//put everything else in
	this._executionOrders.push([]);
	l = this._executionStack.length;
	i = 0;
	while(i < l){
		if(this._inAlready[i.toString]) continue;
		this._inAlready[i.toString()] = true;
		_orderNeedsByObject.call(this,i);
		this._executionOrders[0].push(i);
		i++;
	}
	this._executionThreadLength = this._executionOrders.length
};
/**--module--
name:_orderNeedsByObject - private method
description: orders the execution stack based on where the current object is.
@param{number}
@param{boolean} - push or unshift the array.
*/
var _orderNeedsByObject = function(index){
	var obj = this._executionStack[index],
		i = index + 1,
		temp,t,setsOrModifies;
	while(i--){
		if(this._inAlready[i.toString()]) continue;
		temp = this._executionStack[i];
		if(temp.isAmbiguous){
			if(typeof temp.needs !== "undefined" && Object.keys(temp.needs).length !== 0) _orderNeedsByObject.call(this,i);
			this._executionOrders[0].unshift(i);
			this._inAlready[i.toString()] = true;
			continue;
		}
		setsOrModifies = [];
		if(typeof temp.modifies !== "undefined"){
			setsOrModifies = setsOrModifies.concat(Object.keys(temp.modifies));
		}
		if(typeof temp.sets !== "undefined"){
			setsOrModifies = setsOrModifies.concat(Object.keys(temp.sets));
		}
		t = setsOrModifies.length;
		while(t--){
			if(typeof obj.needs !== "undefined" && obj.needs[setsOrModifies[t]]){
				//We need this object
				if(typeof temp.needs !== "undefined" && Object.keys(temp.needs).length !== 0) _orderNeedsByObject.call(this,i);
				this._executionOrders[0].unshift(i);
				this._inAlready[i.toString()] = true;
				break;
			}
		}
	}
	return index;
};
/**--module--
name:_reduceNeeds - private method
description: reduces the needs, sets and modifies, objects
of all the objects to what they ought to be.
@param{boolean}
*/
var _reduceNeeds = function(master){
	this.needs = {};
	this.sets = {};
	this.modifies = {};
	this.callBackDocs = [];
	var docs = this._document,
		l = docs.length,
		i = 0,
		arr = [],
		count = -1,
		doc, needs,sets,modifies,t,key;
	//actually figure out what Template needs and sets. Modifies is always correct (even when it isn't :)
	while(i < l){
		doc = docs[i];
		if(doc.skip){
			i++;
			continue;
		}
		//get rid of empty strings;
		if(doc instanceof _String && doc.string.length === 0){
			i++;
			continue;
		}
		count++;
		arr.push(doc);
		if(doc.isAmbiguous){
			this.isAmbiguous = true;
		}
		else if(doc.needsCallback){
			this.needsCallback = true;
			this.callBackDocs.push(count);
		}
		
		if(typeof doc.sets !== "undefined"){
			sets = Object.keys(doc.sets);
			t = sets.length;
			while(t--){
				key = sets[t].toLowerCase();
				if(typeof this.sets[key] === "undefined"){
					this.sets[key] = true;
				}
				else{
					delete doc.sets[sets[t]];
				}
			}
		}
		if(typeof doc.needs !== "undefined"){
			needs = Object.keys(doc.needs);
			t = needs.length;
			while(t--){
				key = needs[t].toLowerCase();
				if(typeof this.sets[key] === "undefined"){
					this.needs[key] = true;
				}
			}
		}
		if(typeof doc.modifies !== "undefined"){
			modifies = Object.keys(doc.modifies);
			t = modifies.length;
			while(t--){
				key = modifies[t].toLowerCase();
				this.modifies[key] = true;
			}
		}
		i++;
	}
	this._executionStack = arr;
	this._executionLength = this._executionStack.length;
}
/**--Noodles.Template--
name:execute
description: Template execution
@param {Noodles.Template||object}
@param {Noodles.Context||object}
@param {boolean=}
@return {Template}
*/
_Template.prototype.execute = function(Template,_Context,bufferMode,debugMode){
	var _context,localObj,
		time = Date.now();
	if(!(Template instanceof _Template)){
		_context = new Context(this,Template,!!debugMode);
		_context.time = time;
		_context.onRender = typeof _Context.onRender === "undefined" || _Context.debugMode ? false : _Context.onRender,
		_context.onRenderAll = typeof _Context.onRenderAll === "undefined" ? false : _Context.onRenderAll,
		_context.onFinish = typeof _Context.onFinish === "undefined" ? function(){} : _Context.onFinish;
		_context.bufferMode = !!bufferMode;
	}
	else{
		_context = _Context
	}
	localObj = {};
	localObj.collected = new Array(this._executionLength);
	localObj.status = new Array(this._executionLength);
	localObj.threads = new Array(this._executionThreadLength);
	localObj.startFrom = 0;
	
	
	if(this._master){
		_subExecute.call(this,_context,true,localObj,false);
	}
	else if(this.needsCallback){
		//bufferMode is really the callback if the template isn't a master;
		_subExecute.call(this,_context,true,localObj,bufferMode);
	}
	else{
		return _subExecute.call(this,_context,true,localObj);
	}
};
/**--Noodles.Template--
name:subExecute - private method
*/
var _subExecute = function(Context,first,localObj,callback){
	var i = 0,
		arr = first ? this._executionOrders : localObj.threads[i],
		l = arr.length,
		executing = false,
		_self = this,
		tempColl = [],
		buffer = this._master && Context.bufferMode;
	while(i < l){
		localObj.threads[i] = arr[i].reduce(function(previous,current){
			if(executing){
				return previous.concat(current);
			}
			if(typeof localObj.status[current] === "undefined"){
				if(_self._executionStack[current].needsCallback){
					localObj.status[current] = 'executing';
					if(Context.debugMode) Context._current = current;
					_self._executionStack[current].execute(_self,Context,function(_string){
						localObj.collected[current] = _string;
						localObj.status[current] = 'done';
						_subExecute.call(_self, Context,false,localObj,callback);
					});
					executing = true;
					return previous;
				}
				else{
					if(Context.debugMode) Context._current = current;
					localObj.collected[current] = _self._executionStack[current].execute(_self,Context);
					localObj.status[current] = 'done';
					return previous;
				}
			}
			if(localObj.status[current] === 'executing'){
				executing = true;
				return previous
			}
			if(localObj.status[current] === "done"){
				return previous;
			}
		},[]);
		if(localObj.threads[i].length === 0){
			localObj.threads.splice(i,1);
			l--;
		}
		executing = false;
		i++;
	}
	//render and stuff
	if(Context.onRender && this._master){
		i = localObj.startFrom;
		l = this._executionLength;
		while(i < l ){
			if(typeof localObj.status[i] === "undefined") break;
			if(localObj.status[i] === "done"){
				tempColl.push(localObj.collected[i]);
			}
			else{
				break;
			}
			i++;
		}
		tempColl = buffer && this._master ? new Buffer(tempColl.join('')) : tempColl.join('');
		if(this._master) Context.onRender(tempColl);
		localObj.startFrom = i;
	}
	//finish up.
	if(localObj.threads.length === 0){
		tempColl = buffer && this._master ? new Buffer(localObj.collected.join('')) : localObj.collected.join('');
		if(this._master){
			if(Context.onRenderAll) Context.onRenderAll(tempColl);
			Context.onFinish(Date.now() - Context.time);
		}
		else{
			if(typeof callback === "function"){
				callback(tempColl);
			}
			else{
				return tempColl;
			}
		}
	}
};
/**--Noodles--
name:_registerPlugins - private method
description: registers the plugins of the Template Class
*/
var _registerPlugins = function(){
	var i = this._plugins.length,
		num = i,
		_self = this,
		key, value,t,plugin;
		
	while(i--){
		key = this._plugins[i];
		if(typeof process !== "undefined" && typeof allPlugins[key] === "undefined"){
			plugin = require('./../plugins/'+key).Plugin;
			if(typeof plugin.pluginName === "undefined") throw "The following plugin needs a plugin name: "+ plugin.toString()+'.';
			allPlugins[key] = plugin;
		}
		if(typeof allPlugins[key] !== "undefined"){
			num--;
			plugin = allPlugins[key];
			if(typeof plugin.onTemplateCreate !== "undefined") plugin.onTemplateCreate(this);
			if(typeof plugin.willHandle !== "undefined" && plugin.handleToken !== "undefined"){
				var handle = plugin.willHandle,
					t = handle.length;
				while(t--){
					this._tagDelegation[handle[t]] = plugin.pluginName;
				}
			}
		}
		else {
			require(['./../plugins/' + key],function(plugin){
				num--;
				plugin = plugin.Plugin;
				if(typeof plugin.pluginName === "undefined") throw "The following plugin needs a plugin name: "+ plugin.toString()+'.';
				if(BrowserEnvironment && !plugin.browserFriendly) throw "The pluguin "+plugin.pluginName+" does not work in the browser.";
				if(typeof plugin.onTemplateCreate !== "undefined") plugin.onTemplateCreate(_self);
				allPlugins[plugin.pluginName] = plugin;
				if(typeof plugin.willHandle !== "undefined" && plugin.handleToken !== "undefined"){
					var handle = plugin.willHandle,
						t = handle.length;
					while(t--){
						_self._tagDelegation[handle[t]] = plugin.pluginName;

					}
				}
				if(num === 0){
					_startCreate.call(_self);
				}
			});
		}
	}
	if(num === 0){
		_startCreate.call(this);
	}
};
});