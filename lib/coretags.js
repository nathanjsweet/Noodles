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
}

define('coretags',function(require, exports, module){
//get Noodles
var Noodles = require('noodles');
/*--Coretags--
name:willHandle
description:array of tags that the coretags plugin will handle
@type{array}
*/
exports.willHandle = ['if','loop','set'];
/*--Coretags--
name:onTemplateCreate
description:executed on template creation
@param{Noodles.Template}
*/
exports.onTemplateCreate = function(Template){
	
};
/*--Coretags--
name:onTemplateExecute
description:executed when template is run
@param{Noodles.Context}
@param{Noodles.Template}
*/
exports.onTemplateExecute  = function(Context, Template){
	
};
/*--Coretags--
name:handleToken
description:executed when any tag in "willHandle" is found
@param{expression}
@param{Noodles.Template}
*/
exports.handleToken = function(Template, expression){
	
};
});