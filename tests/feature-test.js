var Noodles = require('./../lib/index.js');
var rawString = [
'<{set one = 1}>',
'<{setahash myhash = nathan:"sweet",kate:"sweet",andrew:"soerens",one:one}>',
'<{loop myhash}>',
'<{value}>',
'<{name}>',
'<{end}>',
'<{myhash["nathan"]}>',
'<{myhash.kate}>',
'<{one}>'
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