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
define(function(require, exports, module){
/**--Noodles--
name:String
description: String Class
@param {Noodles.Template}
@param{string}
@return {Noodles.String}
*/
var _String = exports.String = function(Template,string){
	this.string = string;
	this.length = string.length;
};
/**--Noodles.String--
name:execute
description: String Class execution
@param {Noodles.Template}
@param{Noodles.Context}
@return {string|buffer}
*/
_String.prototype.execute = function(Template,Context){
	return this.string;
};
/**--Noodles.String--
name:type
description: descripes the type of object
@type{string}
*/
_String.prototype.type = "string";
});