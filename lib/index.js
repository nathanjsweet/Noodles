/*
Noodles
High performance templating language for node.js and the browser.
Copyright (C) 2012  Nathan Sweet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
//Require JS for node
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	//if node
	var requirejs = require('require-node');
	var define = requirejs.define;
	requirejs.config({
	    nodeRequire: require,
		baseUrl: __dirname,
	});
	var _exports = exports;
}
else{
	requirejs = require;
}
requirejs(['_noodles_number','_noodles_string','_noodles_utilities','_noodles_template','_noodles_object','_noodles_plugin','_noodles_context'],function(_number,_string,_utilities,_template,_object,_plugin,_context){
define('noodles',function(require, exports, module){

exports.Number = _number.Number;
exports.String = _string.String;
exports.Utilities = _utilities;
exports.Template = _template.Template;
exports.Object = _object.Object;
exports.Plugin = _plugin.Plugin;
exports.Context = _context.Context;

_exports = exports;
});
});