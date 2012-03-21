//Plugin class for Noodles
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
define('_noodles_plugin',function(require, exports, module){
/**--exports--
name: Plugin
description: Plugin Class for Noodles
@param{object}
@return{Noodles.Pluing}
*/
var _Plugin = exports.Plugins = function(args){
	
};
});