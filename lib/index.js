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
	var requirejs = require('requirejs');
	requirejs.config({
	    nodeRequire: require,
		baseUrl: __dirname,
	});
}
exports.Number = requirejs('./number').Number;
exports.String = requirejs('./string').String;
exports.Plugin = requirejs('./plugin').Plugin;
exports.Utilities = requirejs('./utilities');
exports.Template = requirejs('./template').Template;
exports.Object = requirejs('./object').Object;
exports.Context = requirejs('./context').Context;

