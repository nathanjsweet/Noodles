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
/*--Coretags && module--
name:willHandle
description:array of tags that the coretags plugin will handle
@type{array}
*/
var willHandle = exports.willHandle = ['if','loop','set'];
/*--Coretags--
name:onTemplateCreate
description:executed on template creation
@param{Noodles.Template}
*/
exports.onTemplateCreate = function(Template){
	Template.endTags = Template.endTags || {};
	Template.endTags['if'] = true;
	Template.endTags['loop'] = true;
};
/*--Coretags--
name:onTemplateExecute
description:executed when template is run
@param{Noodles.Context}
@param{Noodles.Template}
*/
exports.onTemplateExecute  = function(Context, Template){};
/*--Coretags--
name:handleToken
description:executed when any tag in "willHandle" is found
@param{expression}
@param{Noodles.Template}
@param{string}
*/
exports.handleToken = function(Template, expression, tag){
	swtich(tag){
		case 'if':
			return new Conditional(Template,expression);
		case 'loop':
			return new Loop(Template,expression);
		case 'set':
			return new Set(Template,expression);
		default:
			return {skip:true};
	}
};
/*--module--
name: Conditional
description: Conditional execution
@param {Noodles.Template}
@param {expression}
*/
/*{{if something}}
	{{if poo}}pee{{else}}asdfasfd{{end}}
{{elseif nothin}}
	{{if poop}}pee{{end}}
{{else}}
	bah
{{end}}
*/
var Conditional = function(Template,expression){
	this.rawString = Noodles.Utilities.grabToEndSliceRaw(Template, expression,'If');
	this.conditions = [{
		condition:expression
	}];
	this.needs = {};
	this.parseConditional(Template);
	this.parseConditions(Template);
}
/*--Conditional--
name: parseElses
description: Parses out the elses and elseifs from the tempalte,
	to put them into the Conditional class for later use.
@param {Noodles.Template}
*/
Conditional.prototype.parseConditional = function(Template){
	var reElse = /<\{else(\s*|\}|if\s+)/i,
		rawString = this.rawString,
		endTags = Object.keys(Template.endTags),
		currentIndex = 0,
		regExpArray = [],
		reEnd = /<\{end(\s|\}){1}/i,
		i = endTags.length,
		nextTagThatNeedsEnding, nextEndTag,nextElse,temp;
	
	nextElse = Noodles.Utilities.searchByIndex(rawString,reElse,currentIndex);
	if(nextElse !== -1){
		
		while(i--){
			regExpArray.push(new RegExp('<\\{' + endTags[i] + '\s{1}','i'));;
		}
		while(nextElse !== -1){
			nextTagThatNeedsEnding = Noodles.Utilities.searchByIndex(rawString,regExpArray,currentIndex);
			nextEndTag = Noodles.Utilities.searchByIndex(rawString,reEnd,currentIndex);
			
			if(nenextElse < nextTagThatNeedsEnding && nextElse < nextEndTag || nextTagThatNeedsEnding === -1 && nextEndTag === -1){
				temp = this.conditions.length - 1;
				this.conditions[temp].rawString = rawString.slice(0,currentIndex);
				this.conditions[temp].template = new Noodles.Template(this.conditions[temp].rawString);
				this.needs = Noodles.mergeNeeds(this,this.conditions[t].template);
				Template._leftCount = Template._leftCount + this.conditions[t].template._leftCount;
				
				temp = rawString.indexOf('}>',currentIndex);
				Template._leftCount++;
				this.conditions.push({
					condition : this.parseCondition(Template,rawString.slice(currentIndex,temp))
				});
				rawString = rawString.slice(temp + 2);
				currentIndex = nenextElse + 1;
			}
			else if(nextEndTag > nextTagThatNeedsEnding && nextTagThatNeedsEnding !== -1){
				currentIndex = nextTagThatNeedsEnding + 1;
			}
			else if(nextEndTag !== -1){
				currentIndex = nextEndTag + 1;
			}
			else {
				if(needsEnding !== 0){
					this.skip = true;
					break;
					Noodles.Utilities.warning(Template,'Expression tag not ended properly');
				}
			}
			nextElse = Noodles.Utilities.searchByIndex(rawString,reElse,currentIndex);
		}
	}
	else{
		temp = this.conditions.length - 1;
		this.conditions[temp].rawString = rawString;
		this.conditions[temp].template = new Noodles.Template(this.conditions[temp].rawString);
		this.needs = Noodles.mergeNeeds(this,this.conditions[t].template);
		Template._leftCount = Template._leftCount + this.conditions[t].template._leftCount;
		Template._leftCount++;
	}
	//for the end tag, that isn't there
	Template._leftCount++;
};

Conditional.prototype.parseConditions = function(Template,condition){
	var booleanParser = /(?:\s*)(!?)([^<>=!\s]+)(?:\s*)(==|!=|<|>|<=|>=)?(?:\s*)(!?)([^<>=!\s]+)(?:\s*)/,
		conditions = [],
		length = this.conditions.length,
		orExpression,andExpression;
	if(/else\s*/i.test(condition)) return true;
	if(!(/elseif\s+/i.test(condition))){
		Noodles.Utilities.warning(Template,'Else statement expected');
		return false;
	}
	condition = /elseif\s+(.+)/i.exec(expression)[1];
	condition = condition.split(/\s+or\s+/i);

	for(var i = 0, l = condition.length; i < l; i++){
		orExpression = condition[i];
		orExpression = orExpression.split(/\s+and\s+/i);
		andExpression = []
		for(var i2 = 0, l2 = orExpression.length; i2 < l2; i2++){
			andExpression = booleanParser.exec(orExpression[i2]);
			andExpression[2] = Noodles.parseType(Template,andExpression[2]);
			this.needs = Noodles.mergeNeeds(this,andExpression[2]);
			if(typeof andExpression[3] !== "undefined" && andExpression[5].length > 0){
				andExpression[5] = Noodles.parseType(Template,andExpression[5]);
				this.needs = Noodles.mergeNeeds(this,andExpression[5]);
			}
		}
		conditions.push(andExpression.slice());
	}
	return conditions;
};
});