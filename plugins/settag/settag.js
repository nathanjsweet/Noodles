//Require JS for node
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
}

define(function(require, exports, module){
//get Noodles, the blank concat is to preven requirejs from getting too smart on us.
var Noodles = require('./../../lib/noodles.js');
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
		return [Template.language.tag('set'),
			Template.language.tag('setalist'),
			Template.language.tag('setahash'),
			Template.language.tag('addtolist'),
			Template.language.tag('setaregex')];
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
			case Template.language.tag('setalist'):
				return new SetList(Template,expression);
			case Template.language.tag('setahash'):
				return new SetHash(Template,expression);
			case Template.language.tag('addtolist'):
				return new AddToList(Template,expression);
			case Template.language.tag('setaregex'):
				return new SetARegEx(Template,expression);
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
	if(temp.type !== "object"){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Set tag has bad syntax, the variable must be an identifier or object');
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
/*--module--
name: SetList
description: List object set method
@param {Noodles.Template}
@param {expression}
*/
var SetList = function(Template,expression){
	this.needs = {};
	var reListSplit = /^setalist\s+([^=]+)\s*=\s*(.+)/,
		obj,list,item;
	if(!reListSplit.test(expression)){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Setalist tag has bad syntax');
		return;
	}
	expression = reListSplit.exec(expression)
	obj = Noodles.Utilities.parseType(Template,expression[1]);
	
	if(obj.type !== "object"){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Setalist tag has bad syntax, the variable must be an identifier or object');
		return;
	}
	this.key = obj;
	
	if(this.key.order.length > 1){
		this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.key.needs);
	}
	else{
		this.sets = {};
		this.sets[this.key.order[0]] = true;
	}
	this.modifies = {};
	this.modifies[this.key.order[0]] = true;
	list = expression[2].split(',');
	for(var i = 0, l= list.length; i < l; i++){
		list[i] = Noodles.Utilities.parseType(Template,list[i].trim());
		this.needs = Noodles.Utilities.mergeObjectWith(this.needs,list[i].needs);
	}
	this.value = list;
};
/*--SetList--
name: execute
description: SetList execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
SetList.prototype.execute = function(Template,Context){
	this.key.set(Template,Context,this.value);
	return '';
};
/*--module--
name: SetHash
description: Hash object set method
@param {Noodles.Template}
@param {expression}
*/
var SetHash = function(Template,expression){
	this.needs = {};
	var reHashSplit = /^setahash\s+([^=]+)\s*=\s*(.+)/,
		hashObject =  {},
		obj,hash,value;
	if(!reHashSplit.test(expression)){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Setahash tag has bad syntax');
		return;
	}
	expression = reHashSplit.exec(expression)
	obj = Noodles.Utilities.parseType(Template,expression[1]);
	
	if(obj.type !== "object"){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Setahash tag has bad syntax, the variable must be an identifier or object');
		return;
	}
	this.key = obj;
	
	if(this.key.order.length > 1){
		this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.key.needs);
	}
	else{
		this.sets = {};
		this.sets[this.key.order[0]] = true;
	}
	this.modifies = {};
	this.modifies[this.key.order[0]] = true;
	
	hash = expression[2].split(',');
	for(var i = 0, l= hash.length; i < l; i++){
		hash[i] = hash[i].split(':');
		value = hash[i][0].trim().toLowerCase();
		hashObject[value] = Noodles.Utilities.parseType(Template,hash[i][1].trim())
		this.needs = Noodles.Utilities.mergeObjectWith(this.needs,hashObject[value].needs);
	}
	this.value = hashObject;
};
/*--SetHash--
name: execute
description: SetHash execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
SetHash.prototype.execute = function(Template,Context){
	this.key.set(Template,Context,this.value);
	return '';
};
/*--module--
name: AddToList
description: AddToList object set method
@param {Noodles.Template}
@param {expression}
*/
var AddToList = function(Template,expression){
	this.needs = {};
	var reAddToList = /^addtolist\s+([^=]+)\s+to\s+(.+)/;
	
	if(!reAddToList.test(expression)){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Addtolist tag has bad syntax');
		return;
	}
	expression = reAddToList.exec(expression)
	this.value = Noodles.Utilities.parseType(Template,expression[1]);
	this.list = Noodles.Utilities.parseType(Template,expression[2]);
	if(this.list.type !== "object"){
		this.skip = true;
		Noodles.Utilities.warning(Template,'Addtolist tag has bad syntax, the list must be an identifier or object');
		return;
	}
	this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.value.needs);
	this.needs = Noodles.Utilities.mergeObjectWith(this.needs, this.list.needs);
	this.modifies = {};
	this.modifies[this.list.order[0]] = true;
};
/*--AddToList--
name: execute
description: AddToList execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
AddToList.prototype.execute = function(Template,Context){
	var list = this.list.execute(Template,Context,true);
	list.push(this.value.execute(Template,Context));
	return '';
};
/*--module--
name: SetARegEx
description: SetRegexp method
@param {Noodles.Template}
@param {expression}
*/
//<{setaregex myregexp = "^\s+|\s+$"}>
var SetARegEx = function(Template,expression){
	this.needs = {};
	expression = expression.split(/\s+/);
	this.name = Noodles.Utilities.parseType(Template,expression[0]);
	if(this.name.type !== "object"){
		Noodles.Utilities.warning(Template,'SetARegEx tag has bad syntax, the name must be an identifier');
		this.skip = true;
		return;
	}
	this.value = Noodles.Utilities.parseType(Template,expression[2]);
	this.options = typeof expression[3] === "string" && expression[3].length > 0 ? expression[3].toLowerCase() : false;
	if(this.value.type === "string"){
		this.regex = this.options ? new RegExp(this.value.execute(),this.options) : new RegExp(this.value.execute());
	}
	else if(this.value.type === "object"){
		this.regex = false;
		this.needs = Noodles.Utilities.mergeObjectWith(this.needs,this.value.needs);
		this.modifies = {};
		this.modifies[this.value.order[0]] = true;
	}
	else{
		this.skip = true;
		Noodles.Utilities.warning(Template,'SetARegEx tag has bad syntax, the value must receive a string or object');
		return;
	}
};
/*--SetARegEx--
name: SetARegEx
description: SetRegEx execution
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
SetARegEx.prototype.execute = function(Template,Context){
	var regex = this.regex === false ? this.options ? new RegExp(this.value.execute(Template,Context),this.options) : new RegExp(this.value.execute(Template,Context)) : this.regex;
	this.name.set(Template,Context,regex);
	return '';
};
});