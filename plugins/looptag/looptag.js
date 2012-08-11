if(typeof process !== "undefined")
	var define = require.define;
define(function(require, exports, module){
//get Noodles, the blank concat is to preven requirejs from getting too smart on us.
var Noodles = require('./../../lib/noodles.js');
/*--module--
name:sortFunc
description: sort function for sortloop.
*/
var sortFunc = function(obj,keys,key,Template,Context,desc){
	var name = key === Template.language.other('name'),
		value = key === null || key === Template.language.other('value');
	keys = keys.sort(function(a,b){
		if(value){
			a = obj[a];
			b = obj[b];
			if(typeof a === "object" && typeof a.execute !== "undefined")
				a = a.execute(Template,Context);
			if(typeof b === "object" && typeof b.execute !== "undefined")
				b = b.execute(Template,Context);
		}
		else if(!name){
			a = obj[a];
			b = obj[b];
			if(typeof a === "object" && typeof a.execute !== "undefined")
				a = a.execute(Template,Context);
			if(typeof b === "object" && typeof b.execute !== "undefined")
				b = b.execute(Template,Context);
			a = a[key];
			b = b[key];
			if(typeof a === "object" && typeof a.execute !== "undefined")
				a = a.execute(Template,Context);
			if(typeof b === "object" && typeof b.execute !== "undefined")
				b = b.execute(Template,Context);
		}
		if(desc){
			return b - a;
		}
		else{
			return a - b;
		}
	});
	return keys;
};
/*--exports--
name:Plugin
description:Plugin Class implementation
@type{Noodles.Plugin}
*/
exports.Plugin = new Noodles.Plugin({
	/*--looptag--
	name:willHandle
	description:array of tags that the coretags plugin will handle
	@param{Noodles.Template}
	@return {array}
	*/
	willHandle : function(Template){
		return [Template.language.tag('loop'),Template.language.tag('sortloop')];
	},
	/*--looptag--
	name:pluginName
	@type{string}
	*/
	pluginName : 'looptag',
	/*--looptag--
	name:browserFriendly
	description:is this plugin browser friendly?
	*/
	browserFriendly: true,
	/*--looptag--
	name:onTemplateExecute
	description:executed on template run.
	@param {Noodles.Context}
	@param{Noodles.Template}
	*/
	onTemplateExecute : function(Context,Template){},
	/*--looptag--
	name:onTemplateExecute
	description:executed when template is run
	@param{Noodles.Context}
	@param{Noodles.Template}
	*/
	onTemplateCreate : function(Template){
		Template.endTags = Template.endTags || {};
		Template.endTags[Template.language.tag('loop'),Template.language.tag('sortloop')] = true;
	},
	/*--looptag--
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
			case Template.language.tag('sortloop'):
				return new Loop(Template,expression,true);
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
@param {bool}
*/
var Loop = function(Template,expression,sort){
	var name,set,index;
	
	this.rawString = Noodles.Utilities.grabToEndSliceRaw(Template, expression,Template.language.tag('Loop'));
	this.needs = {};
	expression = expression.split(/\s+/g);
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
	if(this.template.needsCallback){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Loop cannot contain any tags that will take a long time to run');
		delete this.template;
		return;
	}
	Template._leftCount++;//the end tag we sliced above
	this.sets = {};
	this.modifies = {};
	name = Template.language.other('name')
	this.name = new Noodles.Object(this.template,name);
	this.sets[name];
	this.modifies[name];
	value = Template.language.other('value');
	this.value = new Noodles.Object(this.template,value);
	index = '__' + Template.language.other('index')
	this.index = new Noodles.Object(this.template,index);
	this.sets[index];
	this.modifies[index];
	this.setExists = false;
	//<{loop foo as bar}>
	this.sort = !!sort;
	if(expression.length > 3 && (!this.sort || expression[2].toLowerCase() === Template.language.other('as'))){
		this.setObject = new Noodles.Object(this.template,expression[3]);
		if(this.setObject.order.length > 1){
			Noodles.Utilities.warning(Template,'Loop cannot set an object with multiple levels');
			this.skip = true;
			delete this.setObjet;
			return;
		}
		this.setExists = true;
	}
	
	if(this.sort){
		//<{sortloop foo as bar on baz}>
		if(expression.length > 5){
			this.sortKey = expression[5];
		}
		//<{sortloop foo on bar}>
		else if(expression.length > 3 && expression[2].toLowerCase() === Template.language.other('on')){
			this.sortKey = expression[3];
		}
		else{
			this.sortKey = Template.language.other('value');
		}
		//<{sortloop foo as bar on baz descending}>
		if(expression.length > 6){
			this.descending = expression[6].toLowerCase() === Template.language.other("descending");
		}
		//<{sortloop foo on bar descending}> or <{sortloop foo as bar descending}>
		else if(expression.length > 4 && expression[4].toLowerCase() === Template.language.other("descending")){
			this.descending = true;
		}
		//<{sortloop foo descending}>
		else if(expression.length > 2 && expression[2].toLowerCase() === Template.language.other("descending")){
			this.descending = true;
		}
		else{
			this.descending = false;
		}
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
	if(this.sort) keys = sortFunc(_object,keys,this.sortKey,Template,Context,this.descending);
	
	while(i < l && !Context.exitLoop){
		key = keys[i];
		this.name.set(Template,Context,key);
		this.value.set(Template,Context,_object[key]);
		this.index.set(Template,Context,i);
		if(this.setExists) this.setObject.set(Template,Context,_object[key]);
		collection.push(this.template.execute(Template,Context));
		if(Context.continue){
			Context.exitNow = false;
			Context.continue = false;
		}
		i++;
	}
	if(Context.exitLoop){
		Context.exitLoop = false;
		Context.exitNow = false;
	}
	this.name.delete(Template,Context);
	this.value.delete(Template,Context);
	this.index.delete(Template,Context);
	if(this.setExists) this.setObject.delete(Template,Context);
	return collection.join('');
};

});
