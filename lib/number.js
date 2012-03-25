//Number class for Noodles
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
@param{Noodles.Template}
@param{Noodles.Context}
@return {number}
*/
_Number.prototype.execute = function(Template,Context){
	return this.number;
};
/**--Noodles.Number--
name:type
description: descripes the type of object
@type{string}
*/
_Number.prototype.type = "number";	
});