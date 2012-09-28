if(typeof process !== "undefined"){
	var define = require.define;
	var _Noodles = require('./../lib/noodles.js');
}
define(function(require, exports, module){
exports.language = {
	tag:{
		'exit':'exit',
		'exitloop':'exitloop',
		'continue':'continue'
	}
};
});