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
	/*--Coretags--
	name:willHandle
	description:array of tags that the coretags plugin will handle
	@param{Noodles.Template}
	@return {array}
	*/
	willHandle : function(Template){
		return [Template.language.tag('loop')];
	},
	/*--Coretags--
	name:pluginName
	@type{string}
	*/
	pluginName : 'looptag',
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
	onTemplateCreate : function(Template){},
	/*--Coretags--
	name:onTemplateExecute
	description:executed when template is run
	@param{Noodles.Context}
	@param{Noodles.Template}
	*/
	onTemplateCreate : function(Template){
		Template.endTags = Template.endTags || {};
		Template.endTags[Template.language.tag('loop')] = true;
	},
	/*--Coretags--
	name:handleToken
	description:executed when any tag in "willHandle" is found
	@param{expression}
	@param{Noodles.Template}
	@param{string}
	*/
	handleToken : function(Template, expression, tag){
		switch(tag){
			case Template.language.tag('loop'):
				return new Loop(Template,expression);
			default:
				return {skip:true};
		}
	}
});
/*--module--
name: Loop
description: Loop object
@param {Noodles.Template}
@param {expression}
*/
var Loop = function(Template,expression){
	this.rawString = Noodles.Utilities.grabToEndSliceRaw(Template, expression,Template.language.tag('Loop'));
	this.needs = {};
	
	expression = expression.split(' ');
	if(expression.length < 2){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Loop tag has bad syntax');
		return;
	}
	this.object = Noodles.Utilities.parseType(Template,expression[1]);
	if(!(this.object instanceof Noodles.Object)){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Loop must have an object to loop over');
		delete this.object;
		return;
	}
	this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.object.needs);

	this.template = Noodles.Utilities.createSubTemplate(Template,this.rawString, this);
	Template._leftCount++;//the end tag we sliced above
	this.name = new Noodles.Object(this.template,Template.language.other('name'));
	this.value = new Noodles.Object(this.template,Template.language.other('value'));
	this.index = new Noodles.Object(this.template,'__' + Template.language.other('index'));
	this.setExists = false;
	if(expression.length >= 4){
		this.setObject = new Noodles.Object(this.template,expression[3]);
		if(this.setObject.key.order.length > 1){
			Noodles.Utilities.warning(Template,'Loop cannot set an object with multiple levels');
			this.skip = true;
			delete this.setObjet;
			return;
		}
		this.setExists = true;
	}
	
};
/*--Loop--
name: execute
description: Loop execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
Loop.prototype.execute = function(Template,Context,Callback){
	var _object = this.object.execute(Template,Context,true),
		keys = _object !== "" ? Object.keys(_object): "",
		l = keys.length,
		i = 0,
		collection = [],
		key;
	if(keys === "") return "";
	while(i < l){
		key = keys[i];
		this.name.set(Template,Context,key);
		this.value.set(Template,Context,_object[key]);
		this.index.set(Template,Context,i);
		if(this.setExists) this.setObject.set(Template,Context,_object[key]);
		collection.push(this.template.execute(Template,Context));
		i++;
	}
	this.name.delete(Template,Context);
	this.value.delete(Template,Context);
	this.index.delete(Template,Context);
	if(this.setExists) this.setObject.delete(Template,Context);
	return collection.join('');
};

});
