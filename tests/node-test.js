var Noodles = require('./../lib/index.js');
var rawString = ['This is a very basic template. By <{author}>.',
'<{set middlename = "Johnathan"}>',
'<{if firstname == "Nathan" or lastname and middlename}>',
	'<{if firstname}>His firstname is <{firstname}><{else}>We don\'t know his firstname<{end}>.',
	'<{if middlename}>, his middlename is <{middlename}><{end}>',
	' his last name is <{lastname}>',
'<{end}>',
'<{if authors}>',
'<{loop authors}>',
	'index: <{__index}>',
	'name:<{name}>',
	'value:<{value}>',
'<{end}>',
'<{end}>'].join('\n');

var metaData = 'author = <{firstName}> <{lastName}>';
var time = Date.now(),
	object = {'lastname':'Sweet','firstname':'Nathan','authors':["location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp"]},
	object2 = {'lastname':'Sweet','firstname':'Nathan','authors':["location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp","location", "top", "window", "external", "chrome", "v8Locale", "document", "requirejs", "require", "define", "_exports", "_parseConditional", "_Template", "identifier", "plugin", "myTemp"]},
	myTemp;
new Noodles.Template({
	rawString : rawString,
	metaData:metaData,
	onFinishCompiling:function(template){
		time = Date.now() - time;
		myTemp = template;
		console.log('compile time: ',time,'ms');
		testTemp(myTemp,10000);
	}
});

function testTemp(temp,length){
	var arr = [],
		i = length;
	while(i--){
		if((i & 1) === 1){
			temp.execute(object,{
				onRenderAll:function(string){if(i === 0)console.log(string);},
				onFinish:function(time){
					arr.push(time);
				}
			});
		}
		else{
			temp.execute(object2,{
				onRenderAll:function(string){if(i === 0)console.log(string);},
				onFinish:function(time){
					arr.push(time);
				}
			});
		}
	}
	setTimeout(logTime,1000,arr);
};

function logTime(arr){
	var totalTime = 0,
		upperBound = 0,
		lowerBound = Number.POSITIVE_INFINITY;
	for(var i = 0, l = arr.length; i < l; i++){
		if(typeof arr[i] !== "number"){
			setTimeout(logTime,1000,arr);
			return;
		}
		if(arr[i] > upperBound) upperBound = arr[i];
		if(arr[i] < lowerBound) lowerBound = arr[i];
		totalTime += arr[i];
	}
	console.log('The average time was: ', totalTime/l,'ms.\n',
	'The upper bound time was: ', upperBound, 'ms.\n',
	'The lower bound time was: ', lowerBound,'ms.'
	);
	
		
}