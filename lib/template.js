//Template class for Noodles
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	//if node
	var requirejs = require('require-node');
	var define = requirejs.define;
	requirejs.config({
	    nodeRequire: require,
		baseUrl: __dirname,
	});
}
else{
	requirejs = require;
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
name: lambda
description: empty function for whatever.
@type{function}
*/
var lambda = function(){};
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
var corePlugins = ['coretags']
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
		_Template.templateCache[this._id] = {};
		_Template.templateCache[this._id].meta = {};
		this._plugins = corePlugins.slice();
		var metaArr = metaData.split(/\n+/),
			i = metaArr.length,
			reMeta = /([^=]+)(={1})(.*)/,
			meta,name,value,keys,l;
		while(i--){
			if(/^\s+$/.test(metaArr[i])) continue;
			meta = reMeta.exec(metaArr[i].trim());
			name = meta[1].toLowerCase();
			value = meta[3].trim();
			if(_Object.reIdentifier.test(name) && meta[2] === '='){
				if(name === "plugins"){
					this._plugins = this.plugins.concat(value.toLowerCase().split(','));
					continue;
				}
				_Template.templateCache[this._id].meta[name] = new _Template({rawString:value},this);
				//_Template._metaData[name] = true;
			}
		}
		_registerPlugins.call(this);
		this._master = true;
	}
	else if(typeof Template !== "undefined" && Template instanceof _Template){
		this._plugins = Template._plugins.slice();
		_registerPlugins.call(this);
		this._metaData = Template._metaData;
	}
	this._templating = true;
    while(this._templating){
		_create.call(this);
    }
	
};
/**--Noodles.Template--
name:templateCache - 
description: cache for different templates
@type{object}
*/
_Template.templateCache = {};
/**--module--
name:_create - private method
description: creates the document list of the Template Class
*/
var _create = function(){
	this._rawString
	var leftIndex = this._rawString.indexOf('<{'),
        rightIndex = this._rawString.indexOf('}>'),
		expression,tag,lineStart;
		
	if(leftIndex > -1){
		
		this._leftCount++;
		if(rightIndex > -1){
			expression = this._rawString.slice(leftIndex + 2, rightIndex);
			this._document.push( new _String(this, this._rawString.slice(0,leftIndex) ) );
            this._rawString = this._rawString.slice(rightIndex + 2);
			if(expression.charAt(0) === ' '){ 
				_warning(this,'Invalid whitespace at the start of expression');
			}
			else{
				tag = expression.split(' ')[0].toLowerCase();
				lineStart = Utilities.getLineCount(this);
				expression = typeof allPlugins[this._tagDelegation[tag]] !== "undefined" ? allPlugins[this._tagDelegation[tag]].handleToken(this, expression, tag) : Utilities.parseType(this, expression);
				
				if(typeof expression.skip === "undefined" || expression.skip === false){
					
					expression.lineStart = lineStart;
					this._document.push(expression);
					expression.needs = expression.needs || {};
					
				}
				else if(typeof expression.warnings !== "undefined"){
					_warning(this,expression.warnings);
				}
			}
		}
		else{
			_warning(this,'Open ended expression');
		}
	}
	else{
		this._templating = false;
		this._document.push(new _String(this, this._rawString ));
		this._documentLength = this._document.length;
		delete this._rawString;
		tag = Utilities.stringOnly(this._document);
		
		if(tag.stringOnly){
			this._stringOnly = true;
			this._document = [new _String(tag.string)];
			this._documentLength = 1;
			this.needs = {};
		}
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
	//We want to get anything that is ambiguous or requires a callback
	//to execute ASAP because they will be our bottlenecks.
	//1. Anything that modifies or sets something needs to execute in
	//	order against anything that needs that thing.
	//2. Anything that is ambiguous acts as a break point, nothing after it
	//	can render until it's done, ambiguity trumps callbacks.
	//3. Anything that doesn't need anything can render at anytime.
	//Contrary to intuition, going in order is actually ideal, save for
	// our bottlenecks, because the more we can do in order the more we
	// can buffer to the serve in the appropriate order.
	//
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
		i = index,
		temp,t,setsOrModifies;
	while(i--){
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
			if(obj.needs[setsOrModifies[t]]){
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
				if(typeof this.set[key] === "undefined"){
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
	var _context,localObj;
	if(!(Template instanceof _Template)){
		_context = new Context(this,Template);
		_context.debugMode = !!debugMode;
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
					_self._executionStack[current].execute(_self,Context,function(_string){
						localObj.collected[current] = _string;
						localObj.status[current] = 'done';
						_subExecute.call(_self, Context,false,localObj,callback);
					});
					executing = true;
					return previous;
				}
				else{
					localObj.collected[current] = _self._executionStack[current].execute(_self,Context);
					localObj.status[current] = 'done';
					return previous;
				}
			}
			if(Context.status[current] === 'executing'){
				executing = true;
				return previous
			}
			if(Context.stats[current] === "done"){
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
	if(Context.onRender){
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
		tempColl = buffer ? new Buffer(tempColl.join('')) : tempColl.join('');
		Context.onRender(tempColl);
		localObj.startFrom = i;
	}
	//finish up.
	if(localObj.threads.length === 0){
		tempColl = buffer ? new Buffer(localObj.collected.join('')) : localObj.collected.join('');
		if(this._master){
			if(Context.onRenderAll) Context.onRenderAll(tempColl);
			Context.onFinish();
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
		_self = this,
		key, value,t;
	while(i--){
		key = this._plugins[i];
		if(typeof allPlugins[key] !== "undefined"){
			value = allPlugins[key].willHandle
		}
		else {
			_localRequire.call(_self,key);
			continue;
		}
					
		if(typeof value !== "undefined" && 0 < (t = value.length)){
			while(t--){
				_self._tagDelegation[value[t]] = key;
			}
		}
	}
};
/**--module--
name:localRequire - private method
description: get required modules, check in plugins and lib folder
*/
var _localRequire = function(key){
	var _self = this;
	require(['./../plugins/'+ key],function(plugin){
		plugin = plugin.Plugin;
		if(typeof plugin.pluginName === "undefined") throw "The following plugin needs a plugin name: "+ plugin.toString()+'.';
		if(BrowserEnvironment && !plugin.browserFriendly) throw "The pluguin "+plugin.pluginName+" does not work in the browser.";
		if(typeof plugin.onTemplateCreate !== "undefined") plugin.onTemplateCreate(_self);
		if(typeof plugin.willHandle === "undefined" || plugin.handleToken === "undefined") return;
		allPlugins[plugin.pluginName] = plugin;
		var handle = plugin.willHandle,
			i = handle.length;
		while(i--){
			_self._tagDelegation[handle[i]] = plugin.pluginName;
			
		}
	});
};
});