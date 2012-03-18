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
	this.parseElses(Template);
	this.parseConditions();
}
/*--Conditional--
name: parseElses
description: Parses out the elses and elseifs from the tempalte,
	to put them into the Conditional class for later use.
@param {Noodles.Template}
*/
Conditional.prototype.parseElses = function(Template){
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
				this.conditions[this.conditions.length - 1].rawString = rawString.slice(0,currentIndex);
				temp = rawString.indexOf('}>',currentIndex);
				this.conditions.push({
					condition:rawString.slice(currentIndex,temp)
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
				}
			}
			nextElse = Noodles.Utilities.searchByIndex(rawString,reElse,currentIndex);
		}
	}
	else{
		this.conditions[this.conditions.length - 1].rawString = rawString;
	}
};

Conditional.prototype.parseConditions = function(){
	var booleanParser = /(?:\s*)(!?)([^<>=!\s]+)(?:\s*)(==|!=|<|>|<=|>=)?(?:\s*)(!?)([^<>=!\s]+)(?:\s*)/,
		orconditions = [],
		t = 0,
		length = this.conditions.length,
		orExpression,andExpression,expression;
		
	while(t < length){
		expression = this.conditions[t].condition;
		expression = /if\s+(.+)/i.exec(expression)[1];
		expression = expression.split(/\s+or\s+/i);
		this.conditions[t].condition = [];
		for(var i = 0, l = expression.length; i < l; i++){
			orExpression = expression[i];
			orExpression = orExpression.split(/\s+and\s+/i);
			andExpression = []
			for(var i2 = 0, l2 = orExpression.length; i2 < l2; i2++){
				andExpression = booleanParser.exec(orExpression[i2]);
				andExpression[2] = Noodles.parseType(andExpression[2]);
				this.needs = Noodles.mergeNeeds(this,andExpression[2]);
				if(typeof andExpression[3] !== "undefined" && andExpression[5].length > 0){
					andExpression[5] = Noodles.parseType(andExpression[5]);
					this.needs = Noodles.mergeNeeds(this,andExpression[5]);
				}
			}
			this.conditions[t].condition.push(andExpression.slice());
		}
		//some Post processing
		this.conditions[t].template = new Noodles.Template(this.conditions[t].rawString);
		this.needs = Noodles.mergeNeeds(this,this.conditions[t].template);
		t++;
	}
}
});