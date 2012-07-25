Loop
----
The loop tag for Noodles is the second most important control-flow tag. It does one thing, it loops over a specified object and renders a block of text for every key-value pair it encounters in the object it. There are three special keywords that are created and changed by each execution of the loop, "__index", "name", and "value". When the last execution of the loop takes place these variables will be set globally to the last value that they were:
	
	//Where foo = {"bar:"baz","baz":[1,2,3,4]}
	<{loop foo}>
		index:<{__index}>
		"name":<{name}>
		"value":<{value}>
	<{end}>
	//Will render as:
		index:0
		"name":bar
		"value":baz
		
		index:1
		name:baz
		value: 
Note that a value that is an object simply renders as a blank space. A loop can be written in one other was and that is to set the value of each iteration to be referenced by some name:
	
	//Where foo = {"bar:"baz","baz":1}
	<{loop foo as bar}>
		<{bar}>
	<{end}>
	//Will render as:
		baz
		
		1
Loops may contain other tags in them, such as if tags, or set tags.

ExitLoop
--------
Exitloop is a sub-tab of loop, which can only be used in a loop, it allows you to exit a loop whenever you wish. Usually it should be wrapped in some sort of a condition, but it can be used on its own, it simply means the loop will only iterate once up until the "exitloop" statement.
	
	//Where foo = {"bar:"baz","baz":1,foo:"bar"}
	<{loop foo as bar}>
		<{bar}>
		<{if __index == 1}><{exitloop}><{end}>
	<{end}>
	//Will render as:
	baz
	
	1

Continue
--------
Continue is a sub-tag of loop, which can only be used in a loop, it allows you to continue out of the current iteration of the loop, but not to break out of the loop. It will most likely be wrapped in some condition, but it does not have to be.
	
	//Where foo = {"bar:"baz","baz":1,foo:"bar"}
	<{loop foo as bar}>
		<{bar}>
		<{if __index == 1}><{continue}><{end}>
	<{end}>
	//Will render as:
	baz
	
	bar