var Noodles = require('./../lib/noodles');
var rawString = [
'<{setalist mylist = 3,1,4,5,2,6}>',
'<{sortloop mylist as bar}>',
'<{name}>:<{bar}>',
'<{end}>'
].join('\n');
var metaData = 'author = <{firstName}> <{lastName}>';
var time = Date.now(),
	object = {'lastname':'Sweet','firstname':'Nathan','authors':["location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp"]};
new Noodles.Template({
	rawString : rawString,
	metaData:metaData,
	onFinishCompiling:function(template){
		time = Date.now() - time;
		console.log('compile time: ',time,'ms');
		time = Date.now();
		template.execute(object,{
			onRenderAll:function(string){console.log(string);},
			onFinish:function(date){
				console.log(date, 'ms render time');
			}
		});
	}
});