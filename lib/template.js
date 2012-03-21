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
requirejs(['_noodles_utilities'],function(_Utilities){
	
define('_noodles_template',function(require, exports, module){
/**--module--
name: BrowserEnvironment
description: Browser Environment boolean
@type{boolean}
*/	
var BrowserEnvironment = typeof process === "undefined";
/**--module--
name:reIdentifier
description: regular expression to determine Identifier worthiness
@type{RegExp}
*/
var reIdentifier = _Utilities.reIdentifier;
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
	if(typeof metData !== 'undefined'){
		var metaArr = metaData.split(/\n+/),
			i = metaArr.length,
			reMeta = /([^=]+)(={1})(.*)/,
			meta,name,value,keys,l;
		while(i--){
			meta = reMeta.exec(metaArr[i].trim());
			name = meta[1].toLowerCase();
			value = meta[3];
			if(reIdentifier.test(name) && meta[2] === '='){
				this._metaData[name] = new _Template({rawString:value},this);
			}
		}
		this._metaData['plugins'] = this._metaData['plugins'] || [];
		this._plugins = corePlugins.concat(this._metaData['plugins']);
		_registerPlugins.call(this);
		this._master = true;
	}
	else if(typeof Template !== "undefined" && Template instanceof _Template){
		this._plugins = Template._plugins.slice();
		_registerPlugins.call(this);
	}
	this._templating = true;
    while(this._templating){
		_create.call(this);
    }
	
};
/**--Noodles.Template--
name:execute
description: Template execution
@param {Noodles.Template||object}
@param {Noodles.Context||object}
@return {Template}
*/
Template.prototype.execute = function(Template,Context){
	if(!(Template instanceof Noodles.Template)){
		var _Context = new Context(this,Template),
			_onRender = typeof Context.onRender === "undefined" ? function(){} : Context.buffer ? function(string){Context.onRender(new Buffer(string));} : Context.onRender,
			_onRenderAll : typeof Context.onRender === "undefined" ? function(){} : Context.buffer ? function(string){Context.onRenderAll(new Buffer(string));} : Context.onRenderAll,
			_onFinish : typeof Context.onFinish === "undefined" ? function(){} : Context.onFinish;
		
	}
};

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
				lineStart = _getLineCount(this);
				expression = typeof allPlugins[this._tagDelegation[tag]] !== "undefined" ? allPlugins[this._tagDelegation[tag]].handleToken(this, expression, tag) : _parseType(this, expression);
				
				if(typeof expression.skip === "undefined" || expression.skip === false){
					
					expression.lineStart = lineStart;
					this._document.push(expression);
					expression.needs = expression.needs || {};
					//this.needs = _mergeObjectWith(this.needs,expression.needs);
					//this.sets = _mergeObjectWith(this.sets,expression.sets);
					//this.modifies = _mergeObjectWith(this.modifies,expression.modifies);
					
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
		tag = _Utilities.stringOnly(this._document);
		
		if(tag.stringOnly){
			this._stringOnly = true;
			this._document = [new _String(tag.string)];
			this._documentLength = 1;
			this.needs = {};
		}
		__createExecutionOrder.call(this,this._master);
	}
};
/**--module--
name:_createExecutionOrder - private method
description: creates the execution order for a template based on its needs.
@param{boolean}
*/
var _createExecutionOrder = function(master){
	this.needs = {};
	this.sets = {};
	this.modifies = {};
	var docs = this._document,
		l = docs.length,
		i = 0,
		doc, needs,sets,modifies,t,key;
	//actually figure out what Template needs and sets. Modifies is always correct (even when it isn't :)
	while(i < l){
		doc = docs[i];
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
});