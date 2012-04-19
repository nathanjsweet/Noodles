//Require JS for node
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
	var _Noodles = require('./../lib');
}

define(function(require, exports, module){
//get Noodles, the blank concat is to preven requirejs from getting too smart on us.
var Noodles = typeof _Noodles === "undefined" ? require(''+'./../../lib/browser-index') : _Noodles;
/*--exports--
name:Plugin
description:Plugin Class implementation
@type{Noodles.Plugin}
*/
exports.Plugin = new Noodles.Plugin({
	/*--settag--
	name:willHandle
	description:array of tags that the coretags plugin will handle
	@param{Noodles.Template}
	@return {array}
	*/
	willHandle : function(Template){
		return [Template.language.tag('set')];
	},
	/*--settag--
	name:pluginName
	@type{string}
	*/
	pluginName : 'settag',
	/*--settag--
	name:browserFriendly
	description:is this plugin browser friendly?
	*/
	browserFriendly: true,
	/*--settag--
	name:onTemplateCreate
	description:executed on template creation
	@param{Noodles.Template}
	*/
	onTemplateCreate : function(Context,Template){},
	/*--settag--
	name:onTemplateExecute
	description:executed when template is run
	@param{Noodles.Context}
	@param{Noodles.Template}
	*/
	onTemplateExecute : function(Context, Template){},
	/*--settag--
	name:handleToken
	description:executed when any tag in "willHandle" is found
	@param{Noodles.Template}
	@param{string}
	@param{string}
	*/
	handleToken : function(Template, expression, tag){
		switch(tag){
			case Template.language.tag('set'):
				return new Set(Template,expression);
			default:
				return {skip:true};
		}
	}
});
/*--module--
name: Set
description: Set execution
@param {Noodles.Template}
@param {expression}
*/
var Set = function(Template,expression){
	this.needs = {};
	expression = expression.split(' ');
	if(expression.length < 4){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Set tag has bad syntax');
		return;
	}
	var temp = Noodles.Utilities.parseType(Template,expression[1]);
	if(!(temp instanceof Noodles.Object)){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Set tag has bad syntax');
		return;
	}
	this.key = temp;
	
	if(this.key.order.length > 1){
		this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.key.needs);
	}
	else{
		this.sets = {};
		this.sets[this.key.order[0]] = true;
	}
	this.modifies = {};
	this.modifies[this.key.order[0]] = true;
	
	this.value = Noodles.Utilities.parseType(Template,expression[3]);
	this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.value.needs);
};
/*--Set--
name: execute
description: Set execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
Set.prototype.execute = function(Template,Context){
	this.key.set(Template,Context,this.value);
	return '';
};

});