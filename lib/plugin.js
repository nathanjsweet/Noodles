//Plugin class for Noodles
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
}
define(function(require, exports, module){
/**--exports--
name: requiredMethods
description: Array of required methods
@type{array}
*/
var requiredMethods = ['onTemplateCreate','willHandle','onTemplateExecute','handleToken','pluginName','browserFriendly'];
/**--exports--
name: Plugin
description: Plugin Class for Noodles
@param{object}
@return{Noodles.Plugin}
*/
var _Plugin = exports.Plugin = function(args){
	var i = requiredMethods.length,
		key;
	try{
		while(i--){
			key = requiredMethods[i];
			this[key] = args[key];
		}
	}
	catch(e){
		throw "All plugins must provide the member" + key + " even if it is empty.";
	}
	//this.needsCallback = !args.needsCallback ? false : true;
	//this.ambiguous = true || false;
};
});