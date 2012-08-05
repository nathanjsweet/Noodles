var HTTP = require('http'),
	Noodles = require('./../../noodles'),
	fs = require('fs'),
	url = require('url'),
	path = require('path'),
	docsConfig = Noodles.Config.DocsConfig,
	pages = docsConfig.pages,
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
	if(typeof Docs.cache[key] === "undefined" || Docs.cache[key].expires <= Date.now()){
		delete Docs.cache[key];
		return Docs.getFile(key);
	}
	return Docs.cache[key];
};
/**--Docs--
name: getFile
description: gets file from key
@param{string}
*/
Docs.getFile = function(key,prefix){
	if(prefix)
		key = 'page-' + key;
	
	var page =  key.slice('page-'.length),
		file = __dirname + '/files/' + page,
		extension = key.split('.');
	
	key = (extension[extension.length - 1].toLowerCase() === "html" ? key.split('.')[0] : key);
	
	if(path.existsSync(file)){
		buffer = fs.readFileSync(file);
		Docs.addToCache(key,{
			buffer:buffer,
			Length:buffer.length
		});
	}
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
	var pages = fs.readdirSync(__dirname+'/files'),
		i = pages.length,
		page,buffer,file;
	while(i--){
		Docs.getFile(pages[i],true);
	}
	fx();
};
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
		domain = docsConfig.domain,
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
	console.log(docsConfig);
	HTTP.createServer(Docs.listener).listen(docsConfig.port,docsConfig.domain);
});