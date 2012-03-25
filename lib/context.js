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
*/
var Context = exports.Context = function(Template,obj){
	if(typeof _Template === "undefined") _Template = require('./template').Template;
	this._others = obj;
	this._templateId = Template._id;
};
/**--Noodles.Context--
name:Context
description: gets an object from the current Context
@param {Noodles.Template}
@param {string | array}
*/
Context.prototype.getObject = function(Template,key,callback){
	key = typeof key !== "object" ? [key] : key;
	
	var keyTemp = (typeof key[0].execute !== "undefined" ? key[0].execute(this) : key[0]).toLowerCase(),
		obj,keys,keyIndex;
	if(typeof _Template.templateCache[this._templateId].meta.hasOwnProperty(keyTemp) ){
		console.log(temp);
		return _Template.templateCache[this._templateId].meta[keyTemp].execute(Template,this,callback);
	}
	obj = this._others;

	for(var i = 0, l = key.length; i < l; i++){
		keyTemp = typeof key[0].execute !== "undefined" ? key[0].execute(this).toLowerCase() : key[0];
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
	return typeof obj === "object" ? ' ' : obj;
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
};
});