({
	baseUrl: ".",
	name: "noodles",
	out: "./../browser-build/noodles.js",
	deps:function(){
		var Config = require.nodeRequire(__dirname + '/../../../lib/noodles').Config,
			plugins = Config.coretags,
			languages = Config.languages,
			files = [],
			l2 = languages.length,
			t,plugin;
		for(var i = 0, l = plugins.length; i < l; i++){
			plugin = plugins[i];
			files.push('./../plugins/' + plugin + '/' + plugin + '.js');
			for(t = 0; t < l2; t++)
				files.push('./../plugins/'+ plugin + '/' + plugin + '_globalization.' + languages[t] + '.js');
		}
		return files; 
	}()
})