//Object class for Noodles
//otherwise just make sure that the browser version loads before this file.
if(typeof process !== "undefined"){
	//if node
	var requirejs = require('require-node');
	var define = requirejs.define;
	requirejs.config({
	    nodeRequire: require,
		baseUrl: __dirname,
	});
}
else{
	requirejs = require;
}
requirejs(['_noodles_utilities','_noodles_string'],function(_Utilities,_string){
	var _String = _string.String;
define('_noodles_object',function(require, exports, module){
/**--module--
name:reIdentifier
description: regular expression to determine Identifier worthiness
@type{RegExp}
*/
var reIdentifier = _Utilities.reIdentifier;
/**--Noodles--
name:Object
description: Object class
@param {Noodles.Template}
@param{string}
@return {Noodles.Object}
*/
var _Object = exports.Object = function(Template, expression){
	if(expression.length === 0){
		this.skip = true;
		return;
	}
	expression = expression.trim().toLowerCase();
	this.needs = {};

	var reObjParser = /([^\[\.]+)(\.|\[)?(.+)*/,
		reQuote = /^('|")[^'"]+\1{1}$/,
		reNumber = /^\d+$/,
		order = [],
		bracket = false,
		error = false,
		needsArr = [],
		remainder = expression,
		obj,identfier,temp;

	temp = reObjParser.exec(remainder)[1];
	this.needs[temp.toLowerCase()] = true;
	do{
		obj = reObjParser.exec(remainder);
		identifier = obj[1];
		remainder = obj[3];

		if(bracket){
			if(identifier.slice(-1) !== "]"){
				error = true;
				break;
			}
			identifier = identifier.slice(0,-1);
			if(reQuote.test(identifier)){
				identifier = identifier.slice(1,-1)
			}
			else if(reIdentifier.test(identifier)){
				temp = new _Object(identifier);
				this.needs = _Utilities.mergeObjectWith(this.needs,temp.needs);
				order.push(temp);
				continue;
			}
			else if(reNumber.test(identifier)){
				order.push(parseInt(identifier,10));
				continue;
			}
			else{
				error = true;
				break;
			}
		}

		if(bracket || reIdentifier.test(identifier)){
			order.push(identifier);
		}
		else{
			error = true;
			break;
		}
		bracket = obj[2] === "[";
	} while(remainder)

	if(error === true){
		_Utilities.warning(Template,'Invalid object syntax');
		this._skip = true;
		return;
	}

	this.order = order;
	this.olength = order.length;
	this.meta = false;

	if(this.olength === 1 && typeof order[0] === "string" && typeof Template._metaData[order[0]] !== "undefined"){
		this.meta = true;
		this.metaKey = order[0];
		this.needs = _Utilities.mergeObjectWith({},Template._metaData[order[0]].needs);
	}

	temp = _Utilities.stringOnly(this.order);

	if(temp.stringOnly){
		this._stringOnly = true;
		this.meta = false;
		this.order = [new _String(temp.string)];
		this.olength = 1
		this.needs = {};
	}
};
/**--Noodles.Object--
name:execute/get
description: executes the object sequence to return it's value
@param{Noodles.Context}
@return {*}
*/
_Object.prototype.get = _Object.prototype.execute = function(Context){
	if(!this._stringOnly){
		try{
			return Context.getObject(this.order);
		}
		catch(e){
			return false;
		}
	}
	else{
		return this.order[0].execute(Context);
	}
};
/**--Noodles.Object--
name:set
description: sets the value of an object in a particular context
@param{Noodles.Context}
@param {*}
*/
_Object.prototype.set = function(Context,value){
	if(!this.meta){
		try{
			value = typeof value.execute !== "undefined" ? value.execute(Context) : value;
			Context.setObject(this.order,value);
		}
		catch(e){
			return false;
		}
	}
	else {
		throw "Cannot set an already existing meta variable, skipping";
	}
}
/**--Noodles.Object--
name:modifies
description: returns a string that says to the best of the objects,
	ability what it modifies in context, this usually means until
	it rungs into an object within itself.
@return {string}
*/
_Object.prototype.modifies = function(){
	if(typeof this._modifies !== "undefined") return this._modifies;
	var order = this.order,
		i = 0,
		l = order.length,
		arr = [];
	whiel(i < l){
		if(typeof order[i] === "string" || typeof order[i] === "number"){
			arr.push(order[i]);
		}
		else{
			break;
		}
		i++;
	}
	this._modifies = arr;
	return this._modifies
}
/**--Noodles.Object--
name:type
description: descripes the type of object
@type{string}
*/
_Object.prototype.type = "object";
});
});