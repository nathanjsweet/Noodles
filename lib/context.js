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
define('_noodles_context',function(require, exports, module){
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
		obj,keys,keyIndex,tmp;

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