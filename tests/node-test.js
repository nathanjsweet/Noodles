var Noodles = require('./../lib/index.js');
var rawString = ['This is a very basic template. By <{author}>.',
'<{set middlename = "Johnathan"}>',
'<{if firstname == "Nathan" or lastname and middlename}>',
	'<{if firstname}>His firstname is <{firstname}><{else}>We don\'t know his firstname<{end}>.',
	'<{if middlename}>, his middlename is <{middlename}><{end}>',
	' his last name is <{lastname}>',
'<{end}>',
'<{if authors or firstname}>',
'<{loop authors}>',
	'index: <{__index}>',
	'name:<{name}>',
	'value:<{value}>',
'<{end}>',
'<{end}>'].join('\n');

var metaData = 'author = <{firstName}> <{lastName}>';
var date = Date.now(),
myTemp;
new Noodles.Template({
	rawString : rawString,
	metaData:metaData,
	onFinishCompiling:function(template){
		console.log('compile time: ',Date.now()-date,'ms.');
		console.log(template);
		myTemp = template;
		date = Date.now();
		template.execute({'lastname':'Sweet','firstname':'Nathan','authors':["location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp"]},{
			onRenderAll:function(string){
				console.log(Date.now() - date);
				console.log(string);
			}
		});
	}
});