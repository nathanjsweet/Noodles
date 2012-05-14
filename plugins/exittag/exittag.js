//Require JS for node
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
}

define(function(require, exports, module){
//get Noodles, the blank concat is to preven requirejs from getting too smart on us.
var Noodles = require('./../../lib/index.js');
/*--exports--
name:Plugin
description:Plugin Class implementation
@type{Noodles.Plugin}
*/
exports.Plugin = new Noodles.Plugin({
	/*--exittag--
	name:willHandle
	description:array of tags that the coretags plugin will handle
	@param{Noodles.Template}
	@return {array}
	*/
	willHandle : function(Template){
		return [Template.language.tag('exit'),Template.language.tag('exitloop')];
	},
	/*--exittag--
	name:pluginName
	@type{string}
	*/
	pluginName : 'exittag',
	/*--exittag--
	name:browserFriendly
	description:is this plugin browser friendly?
	*/
	browserFriendly: true,
	/*--exittag--
	name:onTemplateCreate
	description:executed on template creation
	@param{Noodles.Template}
	*/
	onTemplateCreate : function(Context,Template){},
	/*--exittag--
	name:onTemplateExecute
	description:executed when template is run
	@param{Noodles.Context}
	@param{Noodles.Template}
	*/
	onTemplateExecute : function(Context, Template){},
	/*--exittag--
	name:handleToken
	description:executed when any tag in "willHandle" is found
	@param{Noodles.Template}
	@param{string}
	@param{string}
	*/
	handleToken : function(Template, expression, tag){
		switch(tag){
			case Template.language.tag('exit'):
				return new Exit(Template,expression);
			case Template.language.tag('exitloop'):
				return new Exit(Template,expression,true);
			default:
				return {skip:true};
		}
	}
});
/*--module--
name: Exit
description: Exit execution
@param {Noodles.Template}
@param {string}
@param {boolean}
*/
var Exit = function(Template,expression,loop){
	this.loop = !!loop;
	this.needs = {};
	this.isAmbiguous = true;
	this.modifies = {};
};
/*--Exit--
name: execute
description: Set execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
Exit.prototype.execute = function(Template,Context,Callback){
	Context.exitNow = true;
	if(this.loop){
		Context.exitLoop = true;
	}
};
});