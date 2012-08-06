var Noodles = require('./../../noodles'),
	microtime = require('microtime'),
	microtimeExists = typeof microtime !== "undefined",
	mT = microtimeExists ? 'μs' : 'ms';
if(microtimeExists)
	Date.now = microtime.now;
var rawString = [
'<{set one = 1}>',
'<{setahash myhash = nathan:"sweet",kate:"sweet",andrew:"soerens",one:one}>',
'<{loop myhash}>',
'<{value}>',
'<{name}>',
'<{end}>',
'<{myhash["nathan"]}>',
'<{myhash.kate}>',
'<{one}>',
'<{loop authors}>',
'<{name}>:<{value}>',
'<{end}>'
].join('\n');
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
		console.log('compile time: ',time, mT);
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
		lowerBound = Number.POSITIVE_INFINITY,
		standardSum = 0,
		mean,sigma,median;
	arr.sort(function(a,b){return a-b;});
	for(var i = 0, l = arr.length; i < l; i++){
		if(typeof arr[i] !== "number"){
			setTimeout(logTime,1000,arr);
			return;
		}
		standardSum += Math.pow(arr[i],2);
		if(arr[i] > upperBound) upperBound = arr[i];
		if(arr[i] < lowerBound) lowerBound = arr[i];
		totalTime += arr[i];
	}
	mean = totalTime/l;
	for(i = 0; i < l; i++){
		standardSum += Math.pow((arr[i] - mean),2);
	}
	sigma = Math.sqrt(standardSum/(l-1));
	median  = arr[Math.round(arr.length/2) - 1];
	console.log('The mean time was: ', totalTime/l,mT+'.\n',
	'The median time was:',median,'μs.\n',
	'The upper bound time was: ', upperBound, mT+'.\n',
	'The lower bound time was: ', lowerBound,mT+'.\n',
	'The standard deviation was:',sigma,mT+'.\n',
	'The number of runs was: ',l+'.');
}