Syntax
========================
Introduction
------------
Noodles Syntax is really quite simple to think about. It is designed to be as unobtrusive as possible, without being logicless. The following is an example of how to access an object in the current context:
	
	//given that foo eqals bar
	<{foo}> //would render as "bar"
	<{"foo"}> //would render as "foo"
	something <{foo}> baz //would render as "something bar baz"

There are additional ways to access values in Noodles. A variable, string, number, or another object can be used to access the property of another object:
	
	//Given that foo is an object with the properties one, two, three, respectively equal to 1, 2, and 3
	//And given that bar is a variable that equals the string, "three"
	<{foo.one}> //woud render as 1
	<{foo["two"]}> // would render as 2
	<{foo[bar]}> // would render as 3
All that a Noodle's template really does is control the flow of text rendering. So some Noodles tags render their block scope rather than "doing anything" themselves, as accessing an object in the above example does. A Normal HTML document, for example, could be easily utilize Noodles for its flow-control rendering:
	
	//Where title is the key of some value.
	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="utf-8">
		<title><{if !title}>Home<{else}><{title}><{end}> - Noodles Documentation</title>
		.
		.
		.
Most templates will have a pre-existing set of objects that populate each page, such as a "request" object. Also, there MAY be a way to implement mini-templating variables that can handle complex operations out of the way of the flow-control of the document itself. These variables or "meta-data" may not always available to write, but if they are, they would probably look something like this:
	
	htmltitle = <{if !title}><{title}><{else}><{title}><{end}>
	pageParameter = <{loop request as param}><{if param.key = "page"}><{param.value}><{exitloop}><{end}><{end}>

Such a set of "meta-data" could be used likewise:
	
	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="utf-8">
		<title><{htmlTitle}> - <{pageParameter}></title>
		.
		.
		.
The "meta-data" in this example would execute it's calculation every time it is accessed, however the if the calculation will always render the same value, base on the current execution, then a backslash ("\") can be added to before the variable declaration to make sure the execution of that variable only occurs once per execution of the template, and that the first execution will be saved to that variable name. Also, comments can be put into the "meta-data" by putting a hash ("#") before them:
	
	#this is a comment and won't affect the meta data in anyway
	#htmltitle = <{title}>
	#the variable above won't be saved in anyway
	\htmltitle = <{if !title}><{title}><{else}><{title}><{end}>
	#the above variable will only run once per execution of the template it belongs to, if it is even accessed more than once.
	pageParameter = <{loop request as param}><{if param.key = "page"}><{param.value}><{exitloop}><{end}><{end}>