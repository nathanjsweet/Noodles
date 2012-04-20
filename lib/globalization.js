if(typeof process !== "undefined"){
	var requirejs = require('requirejs');
	var define = requirejs.define;
}

define(function(require, exports, module){
//	The Globalization class in Noodles is designed to allow warnings, errors, tags, and miscellaneous identifiers
//to be translated dynamically into other languages. This allows templates of other languages to be created.
//	The Class relies on a particular data structure being created as a dictionary whose keys are english
//allowing a translation into the target language to occur. This, unfortunately, means  that all plugins
//need to be written in English if they are expected to work globally. If the Globalization Class is not used,
//the original language that warnings, error, etc are written in wil always be the text that is passed for
//those particular messages.
/*--module--
name:currentLanguages
description: list of lanugages currently available.
@type{object}
*/
var currentLanguages = {};
/*--module--
name:LanguageClasses
description: hash of saved classes
@type{object}
*/
var languageClasses = {}
/*--exports--
name:language
description: function that returns the appropriate class
@param{string}
@param{function}
*/
exports.language = function(lang,callback){
	if(typeof lang !== "string") lang = 'english';
	lang = lang.toLowerCase();
	if(!currentLanguages[this.language]){
		var _self = this;
		if(lang === "english"){
			currentLanguages[lang] = true;
			languageClasses[lang] = new Globalization(lang,{});
			callback(languageClasses[lang]);
		}
		else{
			require(['./../globalization/' + lang],function(lanuage){
				currentLanguages[lang] = true;
				languageClasses[lang] = new Globalization(lang,language);
				callback(languageClasses[lang]);
			});
		}
	}
	else{
		callback(languageClasses[lang]);
	}
};
/*--exports--
name:addToLanguage
description: function adds warnings, tags, errors, etc
	to specified language
@param{string}
@param{object}
*/
exports.addToLanguage = function(language,languageObject){
	language = language.toString();
	language = languageClasses[language];
	var keys = Object.keys(languageObject),
		i = keys.length,
		keys2, i2,temp,temp2;
	while(i-- !== 0){
		temp2 = languageObject[keys[i]];
		keys2 = Object.keys(temp2);
		i2 = keys2.length;
		temp = language[keys[i]];
		while(i2-- !== 0){
			temp[keys2[i2].toLowerCase()] = temp2[keys2[i2]];
		}
	}
};
/*--module--
name:Language
description:Language Class.
*/
var Globalization = function(lang,language){
	this.language = lang;
	if(this.language !== 'english'){
		var keys = Object.keys(language),
			i = keys.length;
		while(i-- !== 0){
			this[keys[i]] = language[keys[i]];
		}
	}
}
/*--Globalization--
name:warning
description:translate warnings
*/
Globalization.prototype.warning = function(string){
	if(typeof string !== "string") return "";
	if(this.language === "english") return string;
	
	return this.warnings[string.toLowerCase()] || string || "";
};
/*--Globalization--
name:error
description:translate warnings
*/
Globalization.prototype.error = function(string){
	if(typeof string !== "string") return "";
	if(this.language === "english") return string;
	
	return this.errors[string.toLowerCase()] || string || "";
};
/*--Globalization--
name:tag
description:translate warnings
*/
Globalization.prototype.tag = function(string){
	if(typeof string !== "string") return "";
	if(this.language === "english") return string;
	
	return this.tags[string.toLowerCase()] || string || "";
};
/*--Globalization--
name:error
description:translate warnings
*/
Globalization.prototype.other = function(string){
	if(typeof string !== "string") return "";
	if(this.language === "english") return string;
	
	return this.others[string.toLowerCase()] || string || "";
};
/*--Globalization--
name:plugin
description:translate pluginName
*/
Globalization.prototype.plugin = function(string){
	if(typeof string !== "string") return "";
	if(this.language === "english") return string;
	
	return this.plugin[string.toLowerCase()] || string || "";
};
/*--Globalization--
name:coreTags
description:coreTags in english
*/
Globalization.prototype.coreTags = ['iftag','settag','looptag'];
});