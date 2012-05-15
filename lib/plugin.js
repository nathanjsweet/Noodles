//Plugin class for Noodles
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
}
define(function(require, exports, module){
var Globalization = require('./globalization');
/**--exports--
name: requiredMethods
description: Array of required methods
@type{array}
*/
var requiredMethods = ['onTemplateCreate','willHandle','onTemplateExecute','handleToken','pluginName','browserFriendly'];
/**--exports--
name: Plugin
description: Plugin Class for Noodles
@param{object}
@return{Noodles.Plugin}
*/
var _Plugin = exports.Plugin = function(args){
	var i = requiredMethods.length,
		_self = this,
		key;
	try{
		while(i--){
			key = requiredMethods[i];
			switch(key){
				case 'willHandle':
					this.willHandle = args.willHandle;
					break;
				case 'pluginName':
					this.pluginName = args.pluginName;
					break;
				case 'browserFriendly':
					this.browserFriendly = args.browserFriendly;
					break;
				default:
				this['_' + key] = args[key];
			}
		}
	}
	catch(e){
		throw "All plugins must provide the member" + key + " even if it is empty.";
	}
	require(['./../plugins/' + this.pluginName + '/' + this.pluginName + '_globalization.js'],function(language){
		_self.languages = language.languages;
	});
};
/**--exports--
name: onTemplateCreate
description: executede on Template Creation
@return{Noodles.Template}
*/
_Plugin.prototype.onTemplateCreate = function(Template, callback){
	var lang = Template.language.language.toLowerCase(),
		_self;
	if(typeof this.languages === "undefined"){
		_self = this;
		setTimeout(function(){
			_self.onTemplateCreate(Template,callback);
		},50);
		return;
	}
	if(!this.languages[lang]){
		Globalization.addToLanguage(lang,this.languages[lang]);
	}
	this._onTemplateCreate(Template);
	callback();
};
/**--exports--
name: onTemplateExecute
description: executede on Template Creation
@param{Noodles.Context}
@param{Noodles.Template}
*/
_Plugin.prototype.onTemplateExecute = function(Context,Template){
	this._onTemplateExecute(Context,Template);
};
/*--exports--
name:handleToken
description:executed when any tag in "willHandle" is found
@param{Noodles.Template}
@param{string}
@param{string}
*/
_Plugin.prototype.handleToken = function(Template,expression,tag){
	return this._handleToken(Template,expression,tag);
};
});