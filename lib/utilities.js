//Utilities namespace for Noodles
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
else{
	requirejs = require;
}
define(function(require, exports, module){
/*--Noodles--
name:Noodles modules
*/
var _String = require('./string').String,
	_Number = require('./number').Number,
	_Object = require('./object').Object;
/**--Noodles.Utilities--
name:_stringOnly - private method
description: determines whether an execution stack has only strings in it.
*/
var _stringOnly = exports.stringOnly = function(stack){
	var i = stack.length,
		bool = true,
		temp = '',
		val;
	while(i--){
		val = stack[i];
		if(!(val instanceof _String) && !val._stringOnly && !(val instanceof _Number)){
			bool = false;
			break;
		}
		else{
			temp = val.execute() + temp;
		}
	}
	return {stringOnly:bool,string:temp};
};
/**--Noodles.Utilities--
name:_warning - private method
description: registers the plugins of the Template Class
@param{Noodles.Template}
@param{string}
*/
var _warning = exports.warning = function(Template,warning){
	var lineCount = _getLineCount(Template),
		i;
	if(typeof warning === "string"){
		Template._warnings.push({warning:warning,lineNumber:lineCount});
	}
	else if(typeof warning !== "undefined"){
		i = warning.length;
		while(i--){
			Template._warnings.unshift({warning:warning,lineNumber:lineCount});
		}
	}
};
/**--Noodles.Utilities--
name:_getLineCount - private method
description: getCurrentLineCount based on leftBrace <{
@param{Template}
*/
var _getLineCount = exports.getLineCount = function(Template){
	var leftCount = Template._leftCount,
		offset = Template._lineOffset,
		string = Template._stringCache,
		braceIndex = -1,
		lineIndex = 0,
		lineCount = 0;
	while(leftCount > 0){
		braceIndex = string.indexOf('<{',braceIndex + 1);
		leftCount--;
	}
	while(braceIndex > lineIndex && lineIndex > -1){
        lineIndex = string.indexOf('\n',lineIndex + 1);
        lineCount++;
    }
	return (lineCount > 0 ? lineCount : 1) + offset;
};
/**--Noodles.Utilities--
name:mergeObjectWith
description: merges the needs the second object with the first.
@param{object}
@param{object}
@return {object}
*/
var _mergeObjectWith = exports.mergeObjectWith = function(obj1,obj2){
	if(typeof obj1 === "undefined" && obj2 === "undefined") return {};
	if(typeof obj1 === "undefined") return obj2;
	if(typeof obj2 === "undefined") return obj1;
	var keys = Object.keys(obj2),
		i = keys.length;
	while(i--){
		obj1[keys[i]] = obj2[keys[i]];
	}
	return obj1;
};
/**--Noodles.Utilities--
name:mergeWarnings
description: merges the warnings of the second object with the first,
	modifying the line numbers of the second to be offset by those of the first,
	or by the offset argument if it's present.
@param{object}
@param{object}
@param{number=}
*/
var _mergeWarnings = exports.mergeWarnings = function(mainObj,subordinateObj){
	if(typeof subordinateObj._warnings !== "undefined" && subordinateObj._warnings.length !== 0){
		if(typeof mainObj._warnings === "undefined") mainObj._warnings = [];
		mainObj._warnings = mainObj._warnings.concat(subordinateObj._warnings.slice());
		mainObj._warnings.sort(function(a,b){
			return a.lineNumber - b.lineNumber;
		});
	}
};
/**--Noodles.Utilities--
name:createSubTemplate
description: creates a template subordinate of "within" another template,
	accounting for things like line offset and object dependencies.
@param{Noodles.Template}
@param{string}
@param{object}
@return{Noodles.Template}
*/
var _createSubTemplate = exports.createSubTemplate = function(Template,rawString,_class){
	if(typeof _Template === "undefined") _Template = require('./template').Template;
	var lineCount = _getLineCount(Template),
		temp = new _Template({rawString:rawString,lineOffset:lineCount},Template);
	_mergeWarnings(Template,temp);
	Template._leftCount = Template._leftCount + temp._leftCount;
	if(typeof _class !== "undefined"){
		_class.needs = _mergeObjectWith(_class.needs,temp.needs);
		_class.sets = _mergeObjectWith(_class.sets,temp.sets);
		_class.modifies = _mergeObjectWith(_class.modifies,temp.modifies);
		_class.needsCallback = !!temp.needsCallback;
	}
	return temp;
};
/**--Noodles--
name:parseType
description: method that takes a raw input and returns it as either
	and Object, String, or Number
@param{Template}
@param{string}
@return {*}
*/
var _parseType = exports.parseType = function(Template,input){
	if(typeof _Template === "undefined") _Template = require('./template').Template;
	input = input.trim();
	if(!(Template instanceof _Template)) throw "parseType expects its first argument to be a Noodles Template";
	if(/^\d+\.?\d*$/.test(input)){
		return new _Number(Template,input);
	}
	else if(/^('|")[^'"]+\1{1}$/.test(input)){
		return new _String(Template,input.slice(1,-1));
	}
	else if(_Object.reIdentifier.test(input)){
		return new _Object(Template,input);
	}
	else{
		return input;
	}
};
/**--Noodles.Utilities--
name:grabToEndSliceRaw
description: This method finds the next plausible end tag for where
	the rawString part of a template leaves off, and returs that sliced
	part of the string, in the process it modifies the rawString object
	of the Template it has been given. This method is dangerous and should
	only be used by people who under the Noodle Engine.
@param{Noodles.Template}
@param{*} - some pluginClass
@return{string}
*/
var _grabToEndSliceRaw = exports.grabToEndSliceRaw = function(Template, expression,tag){
	if(typeof Template.endTags === "undefined") return '';
	var rawString = Template._rawString,
		endTags = Object.keys(Template.endTags),
		currentIndex = 0,
		regExpArray = [],
		reEnd = /<\{end(\s|\}){1}/i,
		i = endTags.length,
		needsEnding = 1,
		nextTagThatNeedsEnding, nextEndTag;
	while(i--){
		regExpArray.push(new RegExp('<\\{' + endTags[i] + '\\s{1}','i'));
	}
	
	while(needsEnding > 0){
		nextTagThatNeedsEnding = _searchByIndex(rawString,regExpArray,currentIndex);
		nextEndTag = _searchByIndex(rawString,reEnd,currentIndex);
		if(nextEndTag > nextTagThatNeedsEnding && nextTagThatNeedsEnding !== -1){
			needsEnding++;
			currentIndex = nextTagThatNeedsEnding + 1;
			nextTagThatNeedsEnding = 0;
		}
		else if(nextEndTag !== -1){
			needsEnding--;
			currentIndex = nextEndTag + 1;
		}
		else {
			if(needsEnding !== 0){
				tag = tag || 'Tag'
				_warning(Template,tag + ' was improperly ended');
				if(typeof expression !== "undefined") expression.skip = true;
				break;
			}
		}
	}
	currentIndex--;
	needsEnding = rawString.indexOf('}>',currentIndex);
	
	Template._rawString = Template._rawString.slice(needsEnding + 2);
	return rawString.slice(0,currentIndex);
	
}
/**--Noodles.Utilities--
name:searchByIndex
description: helper function fo grabEndSliceRaw that searches a string
	ahead of a specified index and returns the index of the matched
	regular expression of -1 if the regular exprssion isn't matched
	after the specified index. It's an expensive method so it shouldn't
	be used lightly.
@param{string}
@param{RegExp|Array}
@param{number=}
*/
var _searchByIndex = exports.searchByIndex = function(string,regexp,index){
	string = string.slice(index);
	if(typeof index === "undefined") index = 0;
	var lowest = -1,
		i,temp;
	if(typeof regexp.length === "undefined"){
		regexp = [regexp];
	}
	i = regexp.length;
	while(i--){
		temp = string.search(regexp[i]);
		if(temp !== -1 && (temp < lowest || lowest === -1)) lowest = temp;
	}
	if(lowest === -1) return -1;
	return lowest + index;
}
});