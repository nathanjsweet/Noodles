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
		page,article,title,m,coreTagStr,plugins;
	while(i--){
		page = pages[i];
		if(page !== 'plugins'){
			if(page === "home"){
				article = markdown.toHTML( fs.readFileSync(__dirname + '/./../README.md').toString() );
			}
			else if(page === "tags"){
				article = markdown.toHTML( fs.readFileSync(__dirname + '/resources/' + page + '.md').toString() );
				m = 0;
				l = coretags.length;
				while(m < l){
					if(path.existsSync(__dirname + '/./../plugins/' + coretags[m] + '/readme.md')){
						article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../plugins/' + coretags[m] + '/readme.md').toString() );
					}
					else if(path.existsSync(__dirname + '/./../../noodles_plugins/' + coretags[m] + '/readme.md')){
						article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../../noodles_plugins/' + coretags[m] + '/readme.md').toString() );
					}
					m++;
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
			for(l = plugins.length, m = 0; m < l; m++){
				if(coreTagStr.indexOf(',' + plugins[m] + ',') !== -1 || /^\./.test(plugins[m])) continue;
				if(regular && path.existsSync(__dirname + '/./../plugins/'+plugins[m]+'readme.md'))
					article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../plugins/' + plugins[m] + '/readme.md').toString() );
				else if(overt && path.existsSync(__dirname + '/./../../noodles_plugins/'+plugins[m]+'readme.md'))
					article = article + markdown.toHTML( fs.readFileSync(__dirname + '/./../../noodles_plugins/' + plugins[m] + '/readme.md').toString() );
			}
		}
		title = page.replace(reWord,function(a){
			return a.toUpperCase();
		})
		pagesList.push({
			page:page,
			article:article,
			title:title
		});
	}
	return pagesList;
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
		noodleTemplate.execute({
			title:page.title,
			article:page.article
		},{
			onRenderAll:function(string,context){
				var fname = context._others['title'].toLowerCase();
				fs.writeSync(fs.openSync(__dirname+'/files/'+fname+'.html','w'),string,0,string.length);
			}
		},true);
	}
};
Docs.grabNoodleTemplate(Docs.renderDocs);