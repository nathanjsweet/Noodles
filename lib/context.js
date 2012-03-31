//Context class for Noodles
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
var _Template = require('./template').Template;
/**--Noodles--
name:Context
description: Template execution
@param {Noodles.Template}
@param {object}
@param {boolean=}
*/
var Context = exports.Context = function(Template,obj,debugMode){
	if(typeof _Template === "undefined") _Template = require('./template').Template;
	this._others = obj;
	this._metaData = Template._metaData;
	if(debugMode){
		this.debugMode = true;
		this.errors = [];
	}
	else{
		this.debugMode = false;
	}
};
/**--Noodles.Context--
name:getObject
description: gets an object from the current Context
@param {Noodles.Template}
@param {string | array}
*/
Context.prototype.getObject = function(Template,key,override){
	key = typeof key !== "object" ? [key] : key;
	
	var keyTemp = key[0].toLowerCase(),
		obj,keys,keyIndex;
	if(this._metaData.hasOwnProperty(keyTemp)){
		return this._metaData[keyTemp].execute(Template,this);
	}
	obj = this._others;

	for(var i = 0, l = key.length; i < l; i++){
		keyTemp = typeof key[0].execute !== "undefined" ? key[0].execute(Template,this).toLowerCase() : key[0];
		if(typeof obj[keyTemp] !== "undefined"){
			obj = obj[keyTemp];
		}
		else{
			keys = ',' + Object.keys(obj).join()+ ',';
			keyIndex = keys.toLowerCase().indexOf(',' + keyTemp +',');
			if(keyIndex > -1){
				keyTemp = keys.slice(keyindex + 1, keyindex + 1 + keyTemp.length);
				obj[keyTemp.toLowerCase()] = obj[keyTemp];
				obj = obj[keyTemp];
			} 
			else{
				obj[keyTemp] = '';
		 		return '';
			}

		}
	}
	return typeof obj === "object" && !override ? ' ' : obj;
};
/**--Noodles.Context--
name:setObject
description: sets an object for the current Context
@param {Noodle.Context}
@param {array}
@param {*}
*/
Context.prototype.setObject = function(Template, key,value){
	key = typeof key !== "object" ? [key] : key;

	var obj = this._others,
		keyTemp = key[0].toLowerCase(),
		obj,keys,keyIndex;
	if(this._metaData.hasOwnProperty(keyTemp)){
		if(this.debugMode) this.error(Template,'Meta Data variable cannot be set at run time');
	}
	for(var i = 0, l = key.length - 1; i < l; i++){
		keyTemp = typeof key[0].execute !== "undefined" ? key[0].execute(Template,this).toLowerCase() : key[0];
		if(typeof obj[keyTemp] !== "undefined"){
			obj = obj[keyTemp];
		}
		else{
			keys = ',' + Object.keys(obj).join()+ ',';
			keyIndex = keys.toLowerCase().indexOf(',' + tmp +',');
			if(keyIndex > -1){
				keyTemp = keys.slice(keyindex + 1, keyindex + 1 + keyTemp.length);
				obj[keyTemp.toLowerCase()] = obj[keyTemp];
				obj = obj[keyTemp];
			} 
			else{
		 		return '';
			}

		}
	}
	obj[(typeof key[l].execute !== "undefined" ? key[l].execute(Template,this) : key[l]).toLowerCase()] = typeof value.execute !== "undefined" ? value.execute(Template,this) : value;
};
/**--Noodles.Context--
name:deleteObject
description: deletes an object for the current Context
@param {Noodle.Context}
@param {array}
@param {*}
*/
Context.prototype.deleteObject = function(Template, key){
	key = typeof key !== "object" ? [key] : key;

	var obj = this._others,
		keyTemp = key[0].toLowerCase(),
		obj,keys,keyIndex;
	if(this._metaData.hasOwnProperty(keyTemp)){
		if(this.debugMode) this.error(Template,'Meta Data variable cannot be deleted at run time');
	}
	for(var i = 0, l = key.length - 1; i < l; i++){
		keyTemp = typeof key[0].execute !== "undefined" ? key[0].execute(Template,this).toLowerCase() : key[0];
		if(typeof obj[keyTemp] !== "undefined"){
			obj = obj[keyTemp];
		}
		else{
			keys = ',' + Object.keys(obj).join()+ ',';
			keyIndex = keys.toLowerCase().indexOf(',' + tmp +',');
			if(keyIndex > -1){
				keyTemp = keys.slice(keyindex + 1, keyindex + 1 + keyTemp.length);
				obj[keyTemp.toLowerCase()] = obj[keyTemp];
				obj = obj[keyTemp];
			} 
			else{
		 		return '';
			}

		}
	}
	delete obj[(typeof key[l].execute !== "undefined" ? key[l].execute(Template,this) : key[l]).toLowerCase()];
};
/**--Noodles.Context--
name:error
description: sets an error for the current context.
@param {Noodle.Template}
@param {string}
@param {*}
*/
Context.prototype.error = function(Template,error){
	var lineNumber = Template._executionStack[Context.current].lineStart;
	this.errors.push({
		error:error + 'on line ' + lineNumber + '.',
		lineNumber:lineNumber
	});
};

});