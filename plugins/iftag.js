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

define(function(require, exports, module){
//get Noodles
var Noodles = require('./../lib/index');
/*--exports--
name:Plugin
description:Plugin Class implementation
@type{Noodles.Plugin}
*/
exports.Plugin = new Noodles.Plugin({
	/*--Coretags--
	name:willHandle
	description:array of tags that the coretags plugin will handle
	@type{array}
	*/
	willHandle :  ['if'],
	/*--Coretags--
	name:pluginName
	@type{string}
	*/
	pluginName : 'iftag',
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
	onTemplateCreate : function(Template){
		Template.endTags = Template.endTags || {};
		Template.endTags['if'] = true;
	},
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
	@param{expression}
	@param{Noodles.Template}
	@param{string}
	*/
	handleToken : function(Template, expression, tag){
		switch(tag){
			case 'if':
				return new Conditional(Template,expression);
			default:
				return {skip:true};
		}
	}
});

/*--module--
name: Conditional
description: Conditional execution
@param {Noodles.Template}
@param {expression}
*/
var Conditional = function(Template,expression){
	this.rawString = Noodles.Utilities.grabToEndSliceRaw(Template, expression,'If');
	this.needs = {};
	this.conditions = [{
		condition:_parseCondtions.call(this,Template,expression,true)
	}];
	_parseConditional.call(this,Template);
}
/*--module--
name: parseConditional - private
description: Parses out the elses and elseifs from the tempalte,
	to put them into the Conditional class for later use.
@param {Noodles.Template}
*/
//	'<{if firstname}>His firstname is <{firstname}><{else}>We don\'t know his firstname<{end}>.',
//	'<{if middlename}>, his middlename is <{middlename}><{end}>',
//	' his last name is <{lastname}>',
_parseConditional = function(Template){
	var reElse = /<\{else(\s*|\}|if\s+)/i,
		rawString = this.rawString,
		endTags = Object.keys(Template.endTags),
		currentIndex = 0,
		regExpArray = [],
		reEnd = /<\{end(\s|\}){1}/i,
		reIf = [/<\{if\s+/i],
		ifs = 0,
		endsTags = [],
		i = endTags.length,
		nextTagThatNeedsEnding, nextEndTag,nextElse,nextIf,temp;
	
	nextElse = Noodles.Utilities.searchByIndex(rawString,reElse,currentIndex);
	if(nextElse !== -1){
		
		while(i--){
			if(endTags[i].toLowerCase() === 'if') continue;
			regExpArray.push(new RegExp('<\\{' + endTags[i] + '\\s{1}','i'));;
		}
		while(nextElse !== -1){
			nextTagThatNeedsEnding = Noodles.Utilities.searchByIndex(rawString,regExpArray,currentIndex);
			nextEndTag = Noodles.Utilities.searchByIndex(rawString,reEnd,currentIndex);
			nextIf = Noodles.Utilities.searchByIndex(rawString,reIf,currentIndex);
			if(nextIf !== -1 && nextIf < nextEndTag && (nextIf < nextElse || nextElse === -1) && (nextIf <= nextTagThatNeedsEnding || nextTagThatNeedsEnding === -1)){
				ifs++;
				endsTags.push('if');
				currentIndex = nextIf + 1;
				nextIf = 0;
			}
			else if(nextTagThatNeedsEnding !== -1 && nextTagThatNeedsEnding < nextEndTag){
				endTags.push('unknown');
				currentIndex = nextTagThatNeedsEnding + 1;
				nextTagThatNeedsEnding = 0;
			}
			else if(nextEndTag !== -1){
				temp = endsTags.pop();
				currentIndex = nextEndTag + 1;
				if(temp === 'if') ifs--;
			}
			else if(nextTagThatNeedsEnding !== -1){
				this.skip = true;
				Noodles.Utilities.warning(Template,'If tag not ended properly');
				break;
			}
			if(ifs === 0 && nextElse !== -1 && nextElse >= currentIndex){
				temp = this.conditions.length - 1;
				this.conditions[temp].rawString = rawString.slice(0, nextElse);
				this.conditions[temp].template = Noodles.Utilities.createSubTemplate(Template,this.conditions[temp].rawString, this);
				
				Template._leftCount++;//the else tag we just sliced
				temp = rawString.indexOf('}>',nextElse);
				this.conditions.push({
					condition : _parseCondtions.call(this,Template,rawString.slice(nextElse+2,temp))
				});
				rawString = rawString.slice(temp + 2);
				currentIndex = 0;
			}
			nextElse = Noodles.Utilities.searchByIndex(rawString,reElse,currentIndex);
		}
	}
	temp = this.conditions.length - 1;
	this.conditions[temp].rawString = rawString;
	this.conditions[temp].template = Noodles.Utilities.createSubTemplate(Template,this.conditions[temp].rawString,this);
	Template._leftCount++;//the end tag that's missing
};
/*--module--
name: parseConditions - private
description: Parses the specifics of the conditional statement
@param {Noodles.Template}
@param {string}
@return {array}
*/
var _parseCondtions = Conditional.parseConditions = function(Template,condition,first){
	var booleanParser = /(?:\s*)(!?)([^<>=!\s]+)(?:\s*)(==|!=|<|>|<=|>=)?(?:\s*)(!?)([^<>=!\s]*)(?:\s*)/,
		conditions = [],
		andStack = [],
		orExpression,andExpression;
		
	if(/else(\s+\.*|)$/i.test(condition)) return 'else';
	
	if(!(/elseif\s+/i.test(condition)) && !first){
		Noodles.Utilities.warning(Template,'Else statement expected');
		return false;
	}
	condition = first ?  /if\s+(.+)/i.exec(condition)[1] : /elseif\s+(.+)/i.exec(condition)[1];
	condition = condition.split(/\s+or\s+/i);
	
	for(var i = 0, l = condition.length; i < l; i++){
		orExpression = condition[i].split(/\s+and\s+/i);
		andStack = [];
		for(var i2 = 0, l2 = orExpression.length; i2 < l2; i2++){
			andExpression = booleanParser.exec(orExpression[i2]);
			andExpression[2] = Noodles.Utilities.parseType(Template,andExpression[2]);
			this.needs = Noodles.Utilities.mergeObjectWith(this.needs,andExpression[2].needs);
			if(typeof andExpression[3] !== "undefined" && andExpression[5].length > 0){
				andExpression[3] = andExpression[3].toLowerCase();
				andExpression[5] = Noodles.Utilities.parseType(Template,andExpression[5]);
				this.needs = Noodles.Utilities.mergeObjectWith(this.needs,andExpression[5].needs);
			}
			andStack.push(andExpression);
		}
		conditions.push(andStack.slice());
	}
	return conditions;
};
/*--Conditional--
name: execute
description: executes the conditionals
@param {Noodles.Template}
@param {Noodles.Context}
@param {function=}
*/
Conditional.prototype.execute = function(Template,Context,Callback){
	var i = 0,
		l = this.conditions.length,
		bool;
	while(i < l){
		if(this.conditions[i].condition === "else"){
			return this.conditions[i].template.execute(Template,Context,Callback);
		} 
		
		bool = this.conditions[i].condition.reduce(function(previous,element){
			if(previous) return true;
			return element.reduce(function(prev,current){
				if(!prev) return false;
				var left = current[1].length > 0 ? !current[2].execute(Template,Context,Callback) : current[2].execute(Template,Context,Callback),
					right;
					left = typeof left === "string" ? left.toLowerCase() : left;
				if(typeof current[3] !== "undefined"){
					right = current[4].lenght > 0 ? !current[5].execute(Template,Context,Callback) : current[5].execute(Template,Context,Callback);
					right = typeof right === "string" ? right.toLowerCase() : right;
					switch(current[3]){
						case '==':
							return left == right;
						case '!=':
							return left != right;
						case '<':
							return left < right;
						case '>':
							return left > right;
						case '<=':
							return left <= right;
						case '>=':
							return left >= right;
						case 'contains':
							return typeof left === "string" && typeof right === "string" ? left.indexOf(right) > -1 : false;
						case 'startswith':
							return typeof left === "string" && typeof right === "string" ? new RegExp('^' + right).test(left) : false;
						case 'endswith':
							return typeof left === "string" && typeof right === "string" ? new RegExp(right + '$').test(left) : false;
						case 'matches':
							return typeof left === "string" && right.constructor.name === "RegExp" ? right.test(left) : false;
						default:
							return false;
					}
				}
				else{
					return !!left;
				}
			},true);
		},false);
		
		if(bool){	
			return this.conditions[i].template.execute(Template,Context,Callback);
		}
		i++;
	}
};

});