//String class for Noodles
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
define('_noodles_string',function(require, exports, module){
/**--Noodles--
name:String
description: String Class
@param{string}
@return {Noodles.String}
*/
var _String = exports.String = function(_self,string){
	this.string = string;
	this.buffer = new Buffer(string);
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
});