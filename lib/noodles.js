/*@license
Noodles Templating Language, A high-performance, platform agnostic, templating system.
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
	var define = require('requirejs');
	define.config({
	    baseUrl: __dirname,
	    nodeRequire: require
	});
}

define(['./template','./number','./string','./plugin','./utilities','./object','./context','./config'],function(template,number,string,plugin,utilities,object,context,config){
	if(typeof process !== "undefined"){
		exports.Template = template.Template;
		exports.Number = number.Number;
		exports.String = string.String;
		exports.Plugin = plugin.Plugin;
		exports.Object = object.Object;
		exports.Context = context.Context;
		exports.Utilities = utilities;
		exports.Config = config;
	}
	else{
		return {
			Template : template.Template,
			Number : number.Number,
			String : string.String,
			Plugin : plugin.Plugin,
			Object : object.Object,
			Context : context.Context,
			Utilities : utilities,
			Config : config
		}
	}
});

