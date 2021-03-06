/*@license
Noodles Templating Language, A high-performance, platform agnostic, templating system.
Copyright (C) 2012  Nathan Sweet

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
//Require JS for node
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	var define = require('requirejs');
	define.config({
	    baseUrl:  __dirname,
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
		template.passNoodles(exports);
	}
	else{
		var obj = {
			Template : template.Template,
			Number : number.Number,
			String : string.String,
			Plugin : plugin.Plugin,
			Object : object.Object,
			Context : context.Context,
			Utilities : utilities,
			Config : config
		};
		template.passNoodles(obj);
		return obj;
	}
});
