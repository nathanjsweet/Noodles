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
	var _exports = exports;
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
name:Utilities
description: Utilities namespace for Noodles
@type{object}
*/
exports.Utilities = {};
/**--Noodles--
name:Template
description: Template Class
@param {string}
@param {string}
@return {Template}
*/
var Template = exports.Template = function(objArg){
	this._rawString = objArg.rawString;
	this._stringCache = objArg.rawString;
	this._document = [];
	this._leftCount = 0;
	this._warnings = [];
	this._metaData = {};
	this._needs = {};
	this._tagDelegation = {};
	this._objects = {};
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
				this._objects[name] = this._metaData[name] = new Template({rawString:value});
			}
		}
		this._metaData['plugins'] = this._metaData['plugins'] || [];
		this._plugins = corePlugins.concat(this._metaData['plugins']);
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
@param {string}
@param {string}
@return {Template}
*/
Template.prototype.execute = function(obj,Context){
	
};
/**--Noodles--
name:Context
description: Template execution
@param {Noodles.Template}
@param {object}
*/
var Context = exports.Context = function(Template,obj){
	this._others = obj;
	this._meta = Template._metaData;
};
/**--Noodles.Context--
name:Context
description: gets an object from the current Context
@param {string | array}
*/
Context.prototype.getObject = function(key){
	key = typeof key !== "object" ? [key] : key;
	
	var keyTemp = (typeof key[0].execute !== "undefined" ? key[0].execute(this) : key[0]).toLowerCase(),
		obj,keys,keyIndex;
	
	if(typeof this._meta[keyTemp] !== "undefined"){
		return this._meta[keyTemp].execute(this);
	}
	obj = this._others;
	
	for(var i = 0, l = key.length; i < l; i++){
		keyTemp = typeof key[0].execute !== "undefined" ? key[0].execute(this).toLowerCase() : key[0];
		if(typeof obj[keyTemp] !== "undefined"){
			obj = obj[keyTemp];
		}
		else{
			keys = ',' + Object.keys(obj).join()+ ',';
			keyIndex = keys.toLowerCase().indexOf(',' + tmp +',');
			if(keyIndex > -1){
				obj = obj[keys.slice(keyindex + 1, keyindex + 1 + tmp.length)];
			} else{
		 		return '';
			}
			
		}
	}
	return typeof obj === "string" ? obj : ' ';
};
/**--Noodles.Context--
name:Context
description: sets an object for the current Context
@param {array}
@param {*}
*/
Context.prototype.setObject = function(key,value){
	key = typeof key !== "object" ? [key] : key;
	
	var obj = this._others,
		keyTemp,obj,keys,keyIndex;
	
	for(var i = 0, l = key.length; i < l; i++){
		keyTemp = typeof key[0].execute !== "undefined" ? key[0].execute(this).toLowerCase() : key[0];
		if(typeof obj[keyTemp] !== "undefined"){
			obj = obj[keyTemp];
		}
		else{
			keys = ',' + Object.keys(obj).join()+ ',';
			keyIndex = keys.toLowerCase().indexOf(',' + tmp +',');
			if(keyIndex > -1){
				obj = obj[keys.slice(keyindex + 1, keyindex + 1 + tmp.length)];
			} else{
		 		return '';
			}
			
		}
	}
	obj = typeof value.execute !== "undefined" ? value.execute(this) : value;
}
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
					this.needs = _mergeNeeds(this,expression);
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
		tag = _stringOnly(this._document);
		
		if(tag.stringOnly){
			this._stringOnly = true;
			this._document = [new _String(tag.string)];
			this._documentLength = 1;
			this.needs = {};
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
		if(!(val instanceof _String) && !val._stringOnly && !(val instanceof _Number)){
			bool = false;
			break;
		}
		else{
			temp = val.execute() + temp;
		}
	}
	return {stringOnly:bool,string:temp};
}
/**--Noodles.Utilities--
name:_warning - private method
description: registers the plugins of the Template Class
@param{Noodles.Template}
@param{string}
*/
var _warning = exports.Utilities.warning = function(Template,warning){
	var lineCount = _getLineCount(Template),
		i;
	if(typeof warning === "string"){
		Template._warnings.push({warning:warning,lineNumber:lineCount});
	}
	else if(typeof warning !== "undefined"){
		i = warning.length;
		while(i--){
			Template._warnings.unshift({warning:warning,lineNumber:lineCount});
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
		if(typeof plugin.onTemplateCreate !== "undefined") plugin.onTemplateCreate(_self);
		if(typeof plugin.willHandle === "undefined" || plugin.handleToken === "undefined") return;
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
		if(typeof plugin.onTemplateCreate !== "undefined") plugin.onTemplateCreate(_self);
		
		if(typeof plugin.willHandle === "undefined" || plugin.handleToken === "undefined") return;
		var handle = plugin.willHandle,
			i = handle.length;
		while(i--){
			_self._tagDelegation[handle[i]] = plugin.pluginName;
			
		}
	});
};
/**--Noodles.Utilities--
name:_getLineCount - private method
description: getCurrentLineCount based on leftBrace <{
@param{Template}
*/
var _getLineCount = exports.Utilities.getLineCount = function(Template){
	var leftCount = Template._leftCount,
		offset = Template._lineOffset,
		string = Template._stringCache,
		braceIndex = -1,
		lineIndex = 0,
		lineCount = 0;
	while(leftCount > 0){
		braceIndex = string.indexOf('<{',braceIndex + 1);
		leftCount--;
	}
	while(braceIndex > lineIndex && lineIndex > -1){
        lineIndex = string.indexOf('\n',lineIndex + 1);
        lineCount++;
    }
	return (lineCount > 0 ? lineCount : 1) + offset;
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
/**--Noodles.Utilities--
name:mergeWarnings
description: merges the warnings of the second object with the first,
	modifying the line numbers of the second to be offset by those of the first,
	or by the offset argument if it's present.
@param{object}
@param{object}
@param{number=}
*/
var _mergeWarnings = exports.Utilities.mergeWarnings = function(mainObj,subordinateObj){
	if(typeof subordinateObj._warnings !== "undefined" && subordinateObj._warnings.length !== 0){
		if(typeof mainObj._warnings === "undefined") mainObj._warnings = [];
		mainObj._warnings = mainObj._warnings.concat(subordinateObj._warnings.slice());
		mainObj._warnings.sort(function(a,b){
			return a.lineNumber - b.lineNumber;
		});
	}
};
/**--Noodles.Utilities--
name:createSubTemplate
description: creates a template subordinate of "within" another template,
	accounting for things like line offset and object dependencies.
@param{Noodles.Template}
@param{string}
@return{Noodles.Template}
*/
var _createSubTemplate = exports.Utilities.createSubTemplate = function(Template,rawString){
	var lineCount = _getLineCount(Template),
		temp = new Noodles.Template({rawString:rawString,lineOffset:lineCount});
	_mergeWarnings(Template,temp);
	Template._leftCount = Template._leftCount + temp._leftCount;
	return temp;
}
/**--Noodles--
name:Object
description: Object class
@param {Noodles.Template}
@param{string}
@return {Noodles.Object}
*/
var _Object = exports.Object = function(Template, expression){
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
		needsArr = [],
		remainder = expression,
		obj,identfier,temp;
		
	temp = reObjParser.exec(remainder)[1];
	if(!this._objects[temp]){
		this.skip = true;
		return false;
	}
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
				this.needs = Noodles.mergeNeeds(this,temp);
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
	
	if(this.olength === 1 && typeof order[0] === "string" && typeof Template._metaData[order[0]] !== "undefined"){
		this.meta = true;
		this.metaKey = order[0];
		this.needs = _mergeNeeds(this,Template._metaData[order[0]]);
	}
	
	temp = _stringOnly(this.order);
	
	if(temp.stringOnly){
		this._stringOnly = true;
		this.meta = false;
		this.order = [new _String(temp.string)];
		this.olength = 1
		this.needs = {};
	}
	temp = 0;
	while(temp < this.order.length && !this.meta){
		if(typeof this.order[temp] === "string" || typeof this.order[temp] === "number"){
			needsArr.unshift(this.order[temp]);
			this.needs[needsArr.join('.')] = true;
		}
		temp++;
	}
};
/**--Noodles.Object--
name:execute/get
description: executes the object sequence to return it's value
@param{Noodles.Context}
@return {*}
*/
_Object.prototype.get = _Object.prototype.execute = function(Context){
	if(!this._stringOnly){
		try{
			return Context.getObject(this.order);
		}
		catch(e){
			return false;
		}
	}
	else{
		return this.order[0].execute(Context);
	}
};
/**--Noodles.Object--
name:set
description: sets the value of an object in a particular context
@param{Noodles.Context}
@param {*}
*/
_Object.prototype.set = function(Context,value){
	if(!this.meta){
		try{
			value = typeof value.execute !== "undefined" ? value.execute(Context) : value;
			Context.setObject(this.order,value);
		}
		catch(e){
			return false;
		}
	}
	else {
		throw "Cannot set an already existing meta variable, skipping";
	}
}
/**--Noodles.Object--
name:modifies
description: returns a string that says to the best of the objects,
	ability what it modifies in context, this usually means until
	it rungs into an object within itself.
@return {string}
*/
_Object.prototype.modifies = function(){
	if(typeof this._modifies !== "undefined") return this._modifies;
	var order = this.order,
		i = 0,
		l = order.length,
		arr = [];
	whiel(i < l){
		if(typeof order[i] === "string" || typeof order[i] === "number"){
			arr.push(order[i]);
		}
		else{
			break;
		}
		i++;
	}
	this._modifies = order.join('.');
	return this._modifies;
}
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
_String.prototype.execute = function(Context){
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
@param{Noodles.Context}
@return {number}
*/
_Number.prototype.execute = function(Context){
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
@param{Template}
@param{string}
@return {*}
*/
var _parseType = exports.parseType = function(Template,input){
	input = input.trim();
	if(!(Template instanceof Noodles.Template)) throw "parseType expects its first argument to be a Noodles Template";
	if(/^\d+\.?\d*$/.test(input)){
		return new _Number(Template,input);
	}
	else if(/^('|")[^'"]+\1{1}$/.test(input)){
		return new _String(Template,input);
	}
	else if(reIdentifier.test(input)){
		return new _Object(Template,input);
	}
	else{
		return input;
	}
};
/**--Noodles.Utilities--
name:grabToEndSliceRaw
description: This method finds the next plausible end tag for where
	the rawString part of a template leaves off, and returs that sliced
	part of the string, in the process it modifies the rawString object
	of the Template it has been given. This method is dangerous and should
	only be used by people who under the Noodle Engine.
@param{Noodles.Template}
@param{*} - some pluginClass
@return{string}
*/
exports.Utilities.grabToEndSliceRaw = function(Template, expression,tag){
	if(typeof Template.endTags === "undefined") return '';
	var rawString = Template.rawString,
		endTags = Object.keys(Template.endTags),
		currentIndex = 0,
		regExpArray = [],
		reEnd = /<\{end(\s|\}){1}/i,
		i = endTags.length,
		needsEnding = 1,
		nextTagThatNeedsEnding, nextEndTag;
	while(i--){
		regExpArray.push(new RegExp('<\\{' + endTags[i] + '\s{1}','i'));;
	}
	
	while(needsEnding > 0){
		nextTagThatNeedsEnding = _searchByIndex(rawString,regExpArray,currentIndex);
		nextEndTag = _searchByIndex(rawString,reEnd,currentIndex);
		if(nextEndTag > nextTagThatNeedsEnding && nextTagThatNeedsEnding !== -1){
			needsEnding++;
			currentIndex = nextTagThatNeedsEnding + 1;
		}
		else if(nextEndTag !== -1){
			needsEnding--;
			currentIndex = nextEndTag + 1;
		}
		else {
			if(needsEnding !== 0){
				tag = tag || 'Tag'
				_warning(Template,tag + ' was improperly ended');
				if(typeof expression !== "undefined") expression.skip = true;
				break;
			}
		}
	}
	needsEnding = rawString.indexOf('}>',currentIndex);
	Template.rawString = Template.rawString.slice(needsEnding+2);
	return rawString.slice(0,currentIndex);
	
}
/**--Noodles.Utilities--
name:searchByIndex
description: helper function fo grabEndSliceRaw that searches a string
	ahead of a specified index and returns the index of the matched
	regular expression of -1 if the regular exprssion isn't matched
	after the specified index. It's an expensive method so it shouldn't
	be used lightly.
@param{string}
@param{RegExp|Array}
@param{number=}
*/
var _searchByIndex = exports.Utilties.searchByIndex function(string,regexp,index){
	if(typeof index === "undefined") index = 0;
	var savedIndex = string.length - 1,
		lowest = -1,
		i,temp;
	string = string.slice(index);
	if(typeof regexp.length === "undefined"){
		regexp = [regexp];
	}
	i = regexp.length;
	while(i--){
		temp = string.search(regexp[i]);
		if(temp !== -1 && (temp < lowest || lowest === -1)) lowest = temp;
	}
	if(lowest === -1) return -1;
	return lowest + savedIndex;
}
/*
Add to node exports object. This only needs to happen in this module,
none of the plugins have to do this, requirejs will take care of them.
*/
_exports = exports;
});