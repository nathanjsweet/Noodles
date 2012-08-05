var Noodles = require('./../../noodles'),
	fs = require('fs'),
	path = require('path'),
	markdown = require('markdown').markdown,
	docsConfig = Noodles.Config.DocsConfig,
	pages = docsConfig.pages,
	coretags = Noodles.Config.coretags;
/*--global--
name:Docs
description:application namespace
@type{object}
*/
var Docs = {};
/*--Docs--
name:grabNoodleTemplate
description: grabs the source for and creates a noodles template object
@param{function} a callback which will returned the compiled template.
*/
Docs.grabNoodleTemplate = function(fx){
	var rawString = fs.readFileSync(__dirname + '/resources/index.html').toString();
	new Noodles.Template({
		rawString: rawString,
		metaData:'',
		onFinishCompiling:fx
	});
};
/*--Docs--
name:buildFileText
description: builds the file texts with a noodles Template
*/
Docs.buildFileTexts = function(noodlesTemplate){
	var i = pages.length,
		pagesList = [],
		reWord = /\b(\w)/g,
		regular,overt,
		page,article,title,m,coreTagStr,plugins,obj,leg;
	while(i--){
		obj = {};
		page = pages[i];
		if(page !== 'plugins'){
			if(page === "home"){
				article = markdown.toHTML( fs.readFileSync(__dirname + '/./../README.md').toString() );
			}
			else if(page === "tags"){
				article = markdown.toHTML( fs.readFileSync(__dirname + '/resources/' + page + '.md').toString() );
				m = 0;
				l = coretags.length;
				leg = 0;
				while(m < l){
					if(path.existsSync(__dirname + '/./../plugins/' + coretags[m] + '/readme.md')){
						leg++;
						article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../plugins/' + coretags[m] + '/readme.md').toString() );
					}
					else if(path.existsSync(__dirname + '/./../../noodles_plugins/' + coretags[m] + '/readme.md')){
						leg++;
						article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../../noodles_plugins/' + coretags[m] + '/readme.md').toString() );
					}
					m++;
				}
				if(leg > 1){
					article = Docs.anchorizeH2Tags(article);
					obj.subnav = article.list;
					article = article.text;
				}
					
			}
			else{
				article = markdown.toHTML( fs.readFileSync(__dirname + '/resources/' + page + '.md').toString() );
			}
		}
		else{
			article = markdown.toHTML( fs.readFileSync(__dirname + '/resources/plugins.md').toString() );
			regular = path.existsSync(__dirname + '/./../plugins');
			if(regular)
				plugins = fs.readdirSync(__dirname + '/./../plugins');
			overt = path.existsSync(__dirname + '/./../../noodles_plugins');
			if(overt)
				plugins.concat(fs.readdirSync(__dirname + '/./../../noodles_plugins'));
			plugins.sort();
			coreTagStr =  ',' + coretags.join() + ',';
			leg = 0;
			for(l = plugins.length, m = 0; m < l; m++){
				if(coreTagStr.indexOf(',' + plugins[m] + ',') !== -1 || /^\./.test(plugins[m])) continue;
				if(regular && path.existsSync(__dirname + '/./../plugins/'+plugins[m]+'readme.md')){
					leg++;
					article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../plugins/' + plugins[m] + '/readme.md').toString() );
				}
				else if(overt && path.existsSync(__dirname + '/./../../noodles_plugins/'+plugins[m]+'readme.md')){
					leg++;
					article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../../noodles_plugins/' + plugins[m] + '/readme.md').toString() );
				}
			}
			if(leg > 1){
				article = Docs.anchorizeH2Tags(article);
				obj.subnav = article.list;
				article = article.text;
			}
		}
		title = page.replace(reWord,function(a){
			return a.toUpperCase();
		});
		obj.page = page;
		obj.article = article;
		obj.title = title;
		pagesList.push(obj);
	}
	return pagesList;
};
/*--Docs--
name:anchorizeH2Tags
description: adds and id to each h2 tag
@param{string}
@return{string}
*/
Docs.anchorizeH2Tags = function(article){
	var reH2 = /(\<h2)\>([^\<]+)/g,
		tmpArr = [];
	article = article.replace(/\<h1\>[^\<]+\<\/h1\>/g,'');
	article = article.replace(reH2,function(a,b,c){
		var cL = c.toLowerCase();
		if(cL === "introduction")
			return "<h2>" + c;
		tmpArr.push(cL);
		return '<h2 id="'+cL+'-tag">' + c;
	});
	return {
		list:tmpArr,
		text:article
	};
};
/*--Docs--
name:renderDocs
description: runs the doc information through the noodles template.
*/
Docs.renderDocs = function(noodleTemplate){
	var pageList = Docs.buildFileTexts(),
		i = pageList.length,
		page;
	while(i--){
		page = pageList[i];
		noodleTemplate.execute(page,{
			onRenderAll:function(string,context){
				var fname = context._others['title'].toLowerCase();
				fs.writeSync(fs.openSync(__dirname+'/files/'+fname+'.html','w'),string,0,string.length);
			}
		},true);
	}
};
Docs.grabNoodleTemplate(Docs.renderDocs);