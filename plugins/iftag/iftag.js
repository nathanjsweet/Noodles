if(typeof process !== "undefined")
	var define = require.define;
define(function(require, exports, module){
//get Noodles, the blank concat is to preven requirejs from getting too smart on us.
var Noodles = require('./../../lib/noodles.js');
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
		return [Template.language.tag('if')];
	},
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
		Template.endTags[Template.language.tag('if')] = true;
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
			case Template.language.tag('if'):
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
	this.rawString = Noodles.Utilities.grabToEndSliceRaw(Template, expression,Template.language.tag('If'));
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
_parseConditional = function(Template){
	var reElse = new RegExp('<\\{' + Template.language.tag('else') + '(\\s*|\\}|' + Template.language.tag('if') + '\\s+)','i'),
		rawString = this.rawString,
		endTags = Object.keys(Template.endTags),
		currentIndex = 0,
		regExpArray = [],
		reEnd = new RegExp('<\\{' + Template.language.tag('end') + '(\\s|\\}){1}','i'),
		reIf = [new RegExp('<\\{' + Template.language.tag('if') + '\\s+','i')],
		ifs = 0,
		endingTags = [],
		i = endTags.length,
		nextTagThatNeedsEnding, nextEndTag,nextElse,nextIf,temp;
	
	nextElse = Noodles.Utilities.searchByIndex(rawString,reElse,currentIndex);
	if(nextElse !== -1){
		
		while(i--){
			if(endTags[i].toLowerCase() ===  Template.language.tag('if')) continue;
			regExpArray.push(new RegExp('<\\{' +  endTags[i] + '\\s{1}','i'));;
		}
		while(nextElse !== -1){
			nextTagThatNeedsEnding = Noodles.Utilities.searchByIndex(rawString,regExpArray,currentIndex);
			nextEndTag = Noodles.Utilities.searchByIndex(rawString,reEnd,currentIndex);
			nextIf = Noodles.Utilities.searchByIndex(rawString,reIf,currentIndex);
			if(nextIf !== -1 && nextIf < nextEndTag && (nextIf < nextElse || nextElse === -1) && (nextIf <= nextTagThatNeedsEnding || nextTagThatNeedsEnding === -1)){
				ifs++;
				endingTags.push('if');
				currentIndex = nextIf + 1;
				nextIf = 0;
			}
			else if(nextTagThatNeedsEnding !== -1 && nextTagThatNeedsEnding < nextEndTag){
				endingTags.push('unknown');
				currentIndex = nextTagThatNeedsEnding + 1;
				nextTagThatNeedsEnding = 0;
			}
			else if(nextEndTag !== -1){
				temp = endingTags.pop();
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
					condition : _parseCondtions.call(this,Template,rawString.slice(nextElse + 2,temp))
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
		reAnd = new RegExp('\\s+' + Template.language.tag('and') + '\\s+','i'),
		orExpression,andExpression;
		
	if(new RegExp(Template.language.tag('else') + '(\\s+\\.*|)$','i').test(condition)) return 'else';
	
	if(!(new RegExp(Template.language.tag('elseif') + '\s+','i').test(condition)) && !first){
		Noodles.Utilities.warning(Template,'Else statement expected');
		return false;
	}
	condition = first ?  /if\s+(.+)/i.exec(condition)[1] : new RegExp(Template.language.tag('elseif') + '\\s+(.+)','i').exec(condition)[1];
	condition = condition.split(new RegExp('\\s+' + Template.language.other('or') + '\\s+','i'));
	
	for(var i = 0, l = condition.length; i < l; i++){
		orExpression = condition[i].split(reAnd);
		andStack = [];
		for(var i2 = 0, l2 = orExpression.length; i2 < l2; i2++){
			andExpression = booleanParser.exec(orExpression[i2]);
			andStack.push(new Condition(andExpression,this,Template));
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
		
		bool = this.conditions[i].condition.reduce(function(previous,current){
			if(previous) return true;
			return current.reduce(function(prev,curr){
				if(!prev) return false;
				return curr.execute(Template,Context);
			},true);
		},false);
		
		if(bool){	
			if(this.needsCallback){
				if(this.conditions[i].template.needsCallback){
					this.conditions[i].template.execute(Template,Context,Callback);
				}
				else{
					Callback(this.conditions[i].template.execute(Template,Context));
				}
				break;
			}
			return this.conditions[i].template.execute(Template,Context);
		}
		i++;
	}
};
/*--module--
name: Condition
description: Condition
@param {array}
@param {Conditional}
@param {Noodles.Template}
*/
var Condition = function(condition,Conditional,Template){
	this.leftSide = Noodles.Utilities.parseType(Template,condition[2]);
	Conditional.needs = Noodles.Utilities.mergeObjectWith(Conditional.needs,this.leftSide.needs);
	this.leftNegate = condition[1].length > 0;
	this.super = false;
	if(typeof condition[3] !== "undefined" && condition[5].length > 0){
		switch(condition[3]){
			case Template.language.other('contains'):
				this.expression = 'contains';
				break;
			case Template.language.other('startswith'):
				this.expression = 'startswith';
				break;
			case Template.language.other('endswith'):
				this.expression = 'endswith';
				break;
			case Template.language.other('matches'):
				this.expression = 'matches';
			default:
				this.expression = condition[3].toLowerCase();
		}
		this.rightSide = Noodles.Utilities.parseType(Template,condition[5]);
		this.rightNegate = condition[4].length > 0
		Conditional.needs = Noodles.Utilities.mergeObjectWith(Conditional.needs,this.rightSide.needs);
	}
	else{
		this.expression = false;
	}
};
/*--Condition--
name: execute
description: Condition executable
@param {Noodles.Template}
@param {Noodles.Context}
*/
Condition.prototype.execute = function(Template,Context){
	var left = this.leftNegate ? !this.leftSide.execute(Template,Context) : this.leftSide.execute(Template,Context),
		right;
		left = typeof left === "string" ? left.toLowerCase() : left;
	if(this.expression){
		right = this.rightNegate ? !this.rightSide.execute(Template,Context) : this.rightSide.execute(Template,Context);
		right = typeof right === "string" ? right.toLowerCase() : right;
		switch(this.expression){
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
				return typeof left === "string" && right.constructor.name === "RegExp" ? right.test(left) : typeof right === "string" ? new RegExp(right).test(left) : false;
			default:
				return false;
		}
	}
	else{
		return !!left;
	}
};

});