if(typeof process !== "undefined") 
	var define = require.define;
define(function(require, exports, module){
/*--exports--
name:coretags
description:array of coretags
@type{array}
*/
exports.coretags = ['iftag','settag','looptag','exittag'];
/*--exports--
name:language
description:array determining language type.
@type{array}
*/
exports.languages = ['english'];
/*--exports--
name:DocsConfig
description:containing Document configuration namespace
@type{object}
*/
exports.DocsConfig = {
	/*--DocsConfig--
	name:pages
	description: a simple list of pages to be built
	@type{array}
	*/
	pages : ['home','syntax','tags','plugins','warnings-errors'],
	/*--DocsConfig--
	name:domain
	description: the domain for the server to listen to serve the documentation out of
	@type{string}
	*/
	domain : 'noodles',
	/*--DocsConfig--
	name:port
	description: the port for the server to listen to serve the documentation out of
	@type{number}
	*/
	port : 80
};
});