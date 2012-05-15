({
	baseUrl: ".",
	name: "index",
	out: "./../browser-build/index.js",
	deps:function(){ 
		console.log()
		var plugins = require.nodeRequire(__dirname + '/../../../lib/index').Config.coretags,
			files = [],
			plugin;
		for(var i = 0, l = plugins.length; i < l; i++){
			plugin = plugins[i];
			files.push('./../plugins/' + plugin + '/' + plugin + '.js');
			files.push('./../plugins/'+ plugin + '/' + plugin + '_globalization.js');
		}
		return files; 
	}()
})