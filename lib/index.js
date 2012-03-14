/*
Noodles
High performance templating language for node.js and the browser.
Copyright (C) 2012  Nathan Sweet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
//strict mode actually provides some performance benefits (so I've been told) in the browser.
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
	//uncomment the following line if you don't want to use require js:
	//var _exports = exports;
}

define('noodles',function(require, exports, module){
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
var Template = exports.Template = function(rawString,metaData){
	this._rawString = this._stringCache = rawString;
	this._document = [];
	this._rightCount = 0;
	this._leftCount = 0;
	this._warnings = [];
	this._metaData = {};
	this._needs = {};
	this._tagDelegation = {};
	this._objects = {};
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
				this._objects[name] = this._metaData[name] = new Template(value);
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
			this._document.push( new _String(this, this._rawString.slice(0,leftIndex) ) );
			this._expressionList.push(this._document.length);
            this._rawString = this._rawString.slice(rightIndex + 2);
			if(expression.charAt(0) === ' '){ 
				_warning.call(this,'Invalid whitespace at the start of expression');
			}
			else{
				tag = expression.split(' ')[0];
				expression = typeof allPlugins[this._tagDelegation[tag]] !== "undefined" ? new allPlugins[this._tagDelegation[tag]](this, expression) : _parseType(this, expression);
				
				if(typeof expression.skip === "undefined" || expression.skip === false){
					
					expression.lineStart = _getLineCount.call(this);
					this._document.push(expression);
					expression.needs = expression.needs || {};
					this.needs = _mergeNeeds(this,expression);
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
		this._document.push(new _String(this, this._rawString ));
		this._documentLength = this._document.length;
		delete this._rawString;
		tag = _stringOnly(this._document);
		
		if(tag.stringOnly){
			this._stringOnly = true;
			this._document = [new _String(tag.string)];
			this._documentLength = 1;
			this.needs = {};
		}
		else{
			
		}
	}
};
var _stringOnly = function(stack){
	var i = stack.length,
		bool = true,
		temp = '',
		val;
	while(i--){
		val = stack[i];
		if(!(val instanceof _String) && !(val instanceof _Number) && !val._stringOnly){
			bool = false;
			break;
		}
		else{
			temp = val.execute() + temp;
		}
	}
	return {stringOnly:bool,string:temp};
}
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
			_localRequire.call(this,key);
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
name:localRequire - private method
description: get required modules, check in plugins and lib folder
*/
var _localRequire = function(key){
	var _self = this;
	
	require(['./../plugins/'+ key],function(plugin){
		if(typeof plugin.pluginName === "undefined") throw "The following plugin needs a plugin name: "+ plugin.toString()+'.';
		if(BrowserEnvironment && !plugin.browserFriendly) throw "The pluguin "+plugin.pluginName+" does not work in the browser.";
		allPlugins[plugin.pluginName] = plugin;
		var handle = plugin.willHandle,
			i = handle.length;
		while(i--){
			_self._tagDelegation[handle[i]] = plugin.pluginName;
		}
	});
	
	require(['./'+ key],function(plugin){
		if(typeof plugin.pluginName === "undefined") throw "The following plugin needs a plugin name: "+ plugin.toString()+'.';
		if(BrowserEnvironment && !plugin.browserFriendly) throw "The pluguin "+plugin.pluginName+" does not work in the browser.";
		allPlugins[plugin.pluginName] = plugin;
		var handle = plugin.willHandle,
			i = handle.length;
		while(i--){
			_self._tagDelegation[handle[i]] = plugin.pluginName;
		}
	});
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
var _mergeNeeds = exports.mergeNeeds = function(obj1,obj2){
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
var _Object = exports.Object = function(_self, expression){
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
		
	this.needs[reObjParser.exec(remainder)[1]];
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
				temp = new _Object(identifier);
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
		this.needs = _mergeNeeds(this,_self._metaData[order[0]]);
	}
	
	temp = _stringOnly(this.order);
	
	if(temp.stringOnly){
		this._stringOnly = true;
		this.meta = false;
		this.order = [new _String(temp.string)];
		this.olength = 1
		this.needs = {};
	}
};
/**--Noodles.Object--
name:execute
description: executes the object sequence to return it's value
@param{object}
@return {*}
*/
_Object.prototype.execute = function(context){
	if(typeof context === "undefined") throw "Noodles object received no context";
	if(!this.meta || !this._stringOnly){
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
	else if(this.meta){
		return _self._metaData[this.metaKey].execute();
	}
	else if(this._stringOnly){
		return this.order[0].execute();
	}
};
/**--Noodles.Object--
name:type
description: descripes the type of object
@type{string}
*/
_Object.prototype.type = "object";
/**--Noodles--
name:String
description: String Class
@param{string}
@return {Noodles.String}
*/
var _String = exports.String = function(_self,string){
	this.string = string;
	this.length = string.length;
};
/**--Noodles.String--
name:execute
description: String Class executiong
@param{object}
@return {string|buffer}
*/
_String.prototype.execute = function(context){
	return this.string;
};
/**--Noodles.String--
name:type
description: descripes the type of object
@type{string}
*/
_String.prototype.type = "string";
/**--Noodles--
name:Number
description: Number Class
@param{number}
@return {Noodles.Number}
*/
var _Number = exports.Number = function(_self,number){
	if(/^\d+$/.test(number)){
		this.number = parseInt(number,10);
	}
	else if(/^[^\d]*\d+[^1-9]*$/.test(number)){
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
_Number.prototype.execute = function(context){
	return this.number;
};
/**--Noodles.Number--
name:type
description: descripes the type of object
@type{string}
*/
_Number.prototype.type = "number";
/**--Noodles--
name:parseType
description: method that takes a raw input and returns it as either
	and Object, String, or Number
@param{object}
@param{string}
@return {*}
*/
var _parstType = exports.parseType = function(context,input){
	input = input.trim();
	
	if(/^\d+\.?\d*$/.test(input)){
		return new _Number(context,input);
	}
	else if(/^('|")[^'"]+\1{1}$/.test(input)){
		return new _String(context,input);
	}
	else if(reIdentifier.test(input)){
		return new _Object(context,input);
	}
	else{
		return input;
	}
};
//add to real exports if it exists
if(typeof _exports !== "undefined") _exports = exports;
});