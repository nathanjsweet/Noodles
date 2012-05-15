var HTTP = require('http'),
	Noodles = require('./../../noodles'),
	fs = require('fs'),
	url = require('url'),
	markdown = require('markdown').markdown,
	pages = ['home','syntax','tags','plugins','warnings-errors'],
	rePages = new RegExp('^(' + pages.join('|') + '|)$');
/**--module--
name: Docs
description: Docs server namespace
@type{object}
*/
var Docs = {};
/**--Docs--
name: Docs.cache
description: caching mechanism
@type{object}
*/
Docs.cache = {};
/**--Docs--
name: Docs.addToCache
description: adds key value pair to cache object
@param{string}
@param{*}
@param{*}
*/
Docs.addToCache = function(key,value,value2){
	var k;
	if(typeof Docs.cache[key] !== "undefined"){
		if(typeof value === "string" && typeof value2 !== "undefined"){
			Docs.cache[key] = {
				value:value2
			};
		}
		else{
			for(k in value){
				if(value.hasOwnProperty(k)){
					Docs.cache[key][k] = value[k];
				}
			}
		}
	}
	else if(typeof value === "string" && typeof value2 !== "undefined"){
		Docs.cache[key][value] = value;
	}
	else{
		Docs.cache[key] = value;
		Docs.cache[key].expires = typeof value.expires !== "undefined" ? Date.now() + value.expires : Number.POSITIVE_INFINITY;
		
	}
};
/**--Docs--
name: getFromCache
description: gets value from key from cache object
@param{string}
*/
Docs.getFromCache = function(key){
	if(typeof Docs.cache[key] === "undefined") return null;
	if(Docs.cache[key].expires <= Date.now()){
		delete Docs.cache[key];
		return null;
	}
	return Docs.cache[key];
};
/**--Docs--
name: deleteFromCache
description: deletes object from cache by key
@param{string}
*/
Docs.deleteFromCache = function(key){
	delete Docs.cache[key];
};
/**--Docs--
name: Docs.getDocuments
description: gets Documents from the files
*/
Docs.getDocuments = function(fx){
	var rawString = fs.readFileSync(__dirname + '/index.html').toString();
	new Noodles.Template({
		rawString : rawString,
		metaData:'',
		onFinishCompiling:function(template){
			var i = pages.length,
				t = i,
				coretags = Noodles.Config.coretags,
				article,page,plugins,l,m;
			coretags.sort();
			while(i--){
				page = pages[i];
				if(page !== 'plugins'){
					if(page === "home"){
						article = markdown.toHTML( fs.readFileSync(__dirname + '/./../README.md').toString() );
					}
					else if(page === "tags"){
						article = markdown.toHTML( fs.readFileSync(__dirname + '/' + page + '.md').toString() );
						m = 0;
						l = coretags.length;
						while(m < l){
							article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../plugins/' + coretags[m] + '/readme.md').toString() );
							m++;
						}
					}
					else{
						article = markdown.toHTML( fs.readFileSync(__dirname + '/' + page + '.md').toString() );
					}
					template.execute({
						title:page[0].toUpperCase() + page.slice(1),
						article:article
					},
					{
						onRenderAll:function(string,context){
							Docs.addToCache('page-' + context._others['title'].toLowerCase(), {
								string:string,
								buffer:new Buffer(string),
								Length:string.length
							});
							t--;
							if(t === 0){
								 fx();
							}
						},
						onFinish:function(time){}
					});
				}
			}
			//get plugins;
			article = markdown.toHTML( fs.readFileSync(__dirname + '/plugins.md').toString() );
			plugins = fs.readdirSync(__dirname + '/./../plugins');
			plugins.sort();
			coretags =  ',' + coretags.join() + ',';
			for(l = plugins.length, i = 0; i < l; i++){
				if(coretags.indexOf(',' + plugins[i] + ',') !== -1 || /^\./.test(plugins[i])) continue;
				article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../plugins/' + plugins[i] + '/readme.md').toString() );
			}
			template.execute({
				title:'Plugins',
				article:article
			},
			{
				onRenderAll:function(string,context){
					Docs.addToCache('page-' + context._others['title'].toLowerCase(), {
						string:string,
						buffer:new Buffer(string),
						Length:string.length
					});
					t--;
					if(t === 0){
						 fx();
					}
				},
				onFinish:function(time){}
			});
		}
	});
}
/**--Docs--
name:listener
description: listens for http requests
@param{request}
@param{response}
*/
Docs.listener = function(request,response){
	var URL = url.parse(request.url),
		host = request.headers.host,
		pathName = URL.pathname.slice(1),
		domain = 'noodles',
		fullPath = 'http://' + host + '/' + pathName,
		respObj;
	if(host !== domain && host.toLowerCase() === domain || host === 'noodles' && !rePages.test(pathName) && rePages.test(pathName.toLowerCase()) || pathName === ''){
		if(pathName === ''){
			fullPath += 'home';
		}
		response.writeHead(301,{'Location':fullPath.toLowerCase(), 'Expires': (new Date).toGMTString()});
		response.end();
	} 
	else if(rePages.test(pathName)){
		respObj = Docs.getFromCache('page-' + pathName);
		response.writeHead(200,{'Content-Type':'text/html','Content-Length':respObj.Length});
		response.end(respObj.buffer);
	}
	else{
		response.writeHead(404,{'Expires': (new Date).toGMTString()});
		response.end();
	}
}
Docs.getDocuments(function(){
	HTTP.createServer(Docs.listener).listen(80,'127.0.0.1');
});