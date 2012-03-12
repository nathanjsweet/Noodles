//strict mode actually provides some performance benefits (so I've been told)
'use strict';
//Require JS for node
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

define('Noodles',function(require, exports, module){
/**--exports,module--
name: Noodles
description: Noodles namespace
@type{object}
*/
var Noodles = exports.Noodles = {};
/**--module--
name:reIdentifier
description: regular expression to determine Identifier worthiness
@type{RegExp}
*/
var reIdentifier = /[^\d\.\['"\s]{1}.*/;
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
@param {string}
@param {string}
@return {Template}
*/
var Template = Noodles.Template = function(rawString,metaData){
	this._rawString = this._stringCache = rawString;
	this._document = [];
	this._rightCount = 0;
	this._leftCount = 0;
	this._expressionList = [];
	this._warnings = [];
	this._metaData = {};
	this._needs = {};
	this._tagDelegation = {};
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
				this._metaData[name] = new Template(value);
			}
		}
	}
	this._metaData['plugins'] = this._metaData['plugins'] || [];
	this._plugins = corePlugins.concat(this._metaData['plugins']);
	_registerPlugins.call(this);
	this._templating = true;
    while(this._templating){
		_create.call(this);
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
		expression,tag;
		
	if(leftIndex > -1){
		
		this._leftCount++;
		if(rightIndex > -1){
			this._rightCount++;
			expression = this._rawString.slice(leftIndex + 2, rightIndex);
			this._document.push( new Noodles.String(this, this._rawString.slice(0,leftIndex) ) );
			this._expressionList.push(this._document.length);
            this._rawString = this._rawString.slice(rightIndex + 2);
			if(expression.charAt(0) === ' '){ 
				_warning.call(this,'Invalid whitespace at the start of expression');
			}
			else{
				tag = expression.split(' ')[0];
				expression = typeof allPlugins[this._tagDelegation[tag]] !== "undefined" ? new allPlugins[this._tagDelegation[tag]](this, expression) : new Noodles.Object(this, expression);
				
				if(typeof expression.skip === "undefined" || expression.skip === false){
					
					expression.lineStart = _getLineCount.call(this);
					this._expressionList.push(this._document.length);
					this._document.push(expression);
					expression.needs = expression.needs || {};
					this.needs = Noodles.mergeNeeds(this,expression);
				}
				else if(typeof expression.warnings !== "undefined"){
					_warning.call(this,expression.warnings);
				}
			}
		}
		else{
			_warning.call(this,'Open ended expression');
		}
	}
	else{
		this._templating = false;
		this._document.push(new Noodles.String(this, this._rawString ));
		this._documentLength = this._document.length;
		delete this._rawString;
	}
};
/**--module--
name:_warning - private method
description: registers the plugins of the Template Class
*/
var _warning = function(warning){
	var lineCount = _getLineCount.call(this),
		i;
	if(typeof warning === "string"){
		this._warnings.push({warning:warning,lineNumber:lineCount});
	}
	else if(typeof warning !== "undefined"){
		i = warning.length;
		while(i--){
			this._warnings.unshift({warning:warning,lineNumber:lineCount});
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
			require(['./plugins/'+ key],function(plugin){
				if(typeof plugin.pluginName === "undefined") throw "The following plugin needs a plugin name: "+ plugin.toString();
				allPlugins[plugin.pluginName] = plugin;
				var handle = plugin.willHandle,
					i = handle.length;
				while(i--){
					_self._tagDelegation[handle[i]] = plugin.pluginName;
				}
			});
			continue;
		}
					
		if(typeof value !== "undefined" && 0 < (t = value.length)){
			while(t--){
				this._tagDelegation[value[t]] = key;
			}
		}
	}
};
/**--module--
name:_getLineCount - private method
description: getCurrentLineCount based on leftBrace <{
*/
var _getLineCount = function(){
	var leftCount = this._leftCount,
		braceIndex = -1,
		lineIndex = 0,
		lineCount = 0;
	while(leftCount > 0){
		braceIndex = this._stringCache.indexOf('<{',braceIndex + 1);
		leftCount--;
	}
	while(braceIndex > lineIndex && lineIndex > -1){
        lineIndex = this._stringCache.indexOf('\n',lineIndex + 1);
        lineCount++;
    }
	return lineCount > 0 ? lineCount : 1;
};
/**--Noodles--
name:mergeNeeds
description: merges the needs the second object with the first.
@param{object}
@param{object}
@return {object}
*/
Noodles.mergeNeeds = function(obj1,obj2){
	if(typeof obj1.needs === "undefined" && obj2.needs === "undefined") return {};
	if(typeof obj1.needs === "undefined") return obj2.needs;
	if(typeof obj2.needs === "undefined") return obj1.needs;
	var keys = Object.keys(obj2),
		i = keys.length;
	while(i--){
		obj1[keys[i]] = obj2[keys[i]];
	}
	return obj1;
};
/**--Noodles--
name:Object
description: Object class
@param{string}
@return {Noodles.Object}
*/
Noodles.Object = function(_self, expression){
	if(expression.length === 0){
		this.skip = true;
		return;
	}
	expression = expression.trim().toLowerCase();
	this.needs = {};
	
	var reObjParser = /([^\[\.]+)(\.|\[)?(.+)*/,
		reQuote = /^('|")[^'"]+\1{1}$/,
		reNumber = /^\d+$/,
		order = [],
		bracket = false,
		error = false,
		remainder = expression,
		obj,identfier,temp;
	do{
		obj = reObjParser.exec(remainder);
		identifier = obj[1];
		remainder = obj[3];
		
		if(bracket){
			if(identifier.slice(-1) !== "]"){
				error = true;
				break;
			}
			identifier = identifier.slice(0,-1);
			if(reQuote.test(identifier)){
				identifier = identifier.slice(1,-1)
			}
			else if(reIdentifier.test(identifier)){
				this.needs[identifier] = true;
				temp = new Noodles.Object(identifier);
				this.needs = Noodle.mergeNeeds(this,temp);
				order.push(temp);
				continue;
			}
			else if(reNumber.test(identifier)){
				order.push(parseInt(identifier,10));
				continue;
			}
			else{
				error = true;
				break;
			}
		}
		
		if(bracket || reIdentifier.test(identifier)){
			order.push(identifier);
		}
		else{
			error = true;
			break;
		}
		bracket = obj[2] === "[";
	} while(remainder)
	
	if(error === true){
		this._warnings = [];
		this._warnings.push('Invalid object syntax');
		this._skip = true;
		return;
	}
	
	this.order = order;
	this.olength = order.length;
	this.meta = false;
	
	if(this.olength === 1 && typeof order[0] === "string" && typeof _self._metaData[order[0]] !== "undefined"){
		this.meta = true;
		this.metaKey = order[0];
		this.needs = Noodles.mergeNeeds(this,_self._metaData[order[0]]);
	}
};
/**--Noodles.Object--
name:execute
description: executes the object sequence to return it's value
@param{object}
@return {*}
*/
Noodles.Object.prototype.execute = function(_self,context){
	if(typeof context === "undefined") throw "Noodles object received no context";
	if(!this.meta){
		var obj = context,
			order = this.order,
			l = this.olength,
			i = 0,
			key;
		try{
			while(i < l){
				key = order[i];
				if(typeof key !== "string") key = key.execute();
				obj = obj[key];
				i++;
			}
		}
		catch(e){
			throw "Noodles object could not resolve";
		}
		return obj;
	}
	else{
		return _self._metaData[this.metaKey].execute();
	}
};
/**--Noodles--
name:String
description: String Class
@param{string}
@return {Noodles.String}
*/
Noodles.String = function(string){
	this.string = string;
	if(typeof process !== "undefined") this.buffer = new Buffer(string);
	this.length = string.length;
};
/**--Noodles.String--
name:execute
description: String Class executiong
@param{object}
@param{boolean} - if a buffer is desired instead.
@return {string|buffer}
*/
Noodles.String.prototype.execute = function(context,buffer){
	return buffer ? this.buffer : this.string;
};
/**--Noodles--
name:Number
description: Number Class
@param{number}
@return {Noodles.Number}
*/
Noodles.Number = function(number){
	if(/^\d+$/.test(number)){
		this.number = parseInt(number,10);
	}
	else if(/^[^\d]*\d+[^\D0]*$/.test(number)){
		this.number = parseInt(number,10);
	}
	else if(/^[\d]*\d+\.{1}\d+[^\d]/.test(number)){
		if(/^0+$/.test(/\d+\.{1}(\d)+/.exec(number)[1])){
			this.number = parseInt(number,10);
		}
		else{
			this.number = parseFloat(number,10);
		}
	}
	else{
		this.number = parseInt(number,10);
	}
};
/**--Noodles.Number--
name:execute
description: Number Class executiong
@param{object}
@return {number}
*/
Noodles.String.prototype.execute = function(context){
	return this.number;
};
});