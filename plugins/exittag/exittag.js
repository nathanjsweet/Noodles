if(typeof process !== "undefined")
	var define = require.define;
define(function(require, exports, module){
var Noodles;
/*--exports--
name:Plugin
description:Plugin Class implementation
@type{Noodles.Plugin}
*/
exports.Plugin = {
	/*--Coretags--
	name:getNoodles
	description:gets the noodles object
	@param{Noodles}
	*/
	getNoodles : function(_Noodles){
		Noodles = _Noodles;
	},
	/*--Coretags--
	name:willHandle
	description:array of tags that the coretags plugin will handle
	@param{Noodles.Template}
	@return {array}
	*/
	willHandle : function(Template){
		return [Template.language.tag('exit'),Template.language.tag('exitloop'),Template.language.tag('continue')];
	},
	/*--Coretags--
	name:pluginName
	@type{string}
	*/
	pluginName : 'exittag',
	/*--Coretags--
	name:browserFriendly
	description:is this plugin browser friendly?
	*/
	browserFriendly: true,
	/*--Coretags--
	name:onTemplateCreate
	description:executed on template creation
	@param{Noodles.Template}
	*/
	onTemplateCreate : function(Context,Template){},
	/*--Coretags--
	name:onTemplateExecute
	description:executed when template is run
	@param{Noodles.Context}
	@param{Noodles.Template}
	*/
	onTemplateExecute : function(Context, Template){},
	/*--Coretags--
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
			case Template.language.tag('continue'):
				return new Continue(Template,expression);
			case Template.language.tag('exitloop'):
				return new Exit(Template,expression,true);
			default:
				return {skip:true};
		}
	}
};
/*--module--
name: Exit
description: Exit object
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
description: Exit execution
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
/*--module--
name: Continue object
description: Continue object
@param {Noodles.Template}
@param {string}
*/
var Continue = function(Template,expression){
	this.loop = !!loop;
	this.needs = {};
	this.isAmbiguous = true;
	this.modifies = {};
};
/*--Continue--
name: execute
description: Continue execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
Continue.prototype.execute = function(Template,Context,Callback){
	Context.exitNow = true;
	Context.continue = true;
};
});