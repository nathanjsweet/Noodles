Loop
----
The loop tag for Noodles is the second most important control-flow tag. It does one thing, it loops over a specified object and renders a block of text for every key-value pair it encounters in the object it. There are three special keywords that are created and changed by each execution of the loop, "__index", "name", and "value". These variables will only exist within the loop execution/scope/block, they will NOT exist as their lastly executed values:
	
	//Where foo = {"bar:"baz","baz":[1,2,3,4]}
	<{loop foo}>
		index:<{__index}>
		"name":<{name}>
		"value":<{value}>
	<{end}>
	index:<{__index}>
	//Will render as:
		index:0
		"name":bar
		"value":baz
		
		index:1
		name:baz
		value:
	index:	 
Note that a value that is an object simply renders as a blank space. A loop can be written in one other was and that is to set the value of each iteration to be referenced by some name:
	
	//Where foo = {"bar:"baz","baz":1}
	<{loop foo as bar}>
		<{bar}>
	<{end}>
	//Will render as:
		baz
		
		1
Loops may contain other tags in them, such as if tags, or set tags.

SortLoop
--------
The sortloop tag does everything that the loop tag does, except it accepts extra options that will sort the object in a given order. If no sort
option is given to it, it will simply sort by value. It cannot sort by "__index":
	
	//where foo = [3,1,4,5,2,6]
	<{sortloop foo}><{name}>:<{value}> | <{end}> [OR] <{sortloop foo as bar}><{name}>:<{bar}> | <{end}>
	//will render:
	1:1 | 4:2 | 0:3 | 2:4 | 3:5 | 5:6 | 
	//where foo = [3,1,4,5,2,6]
	<{sortloop foo on name}><{name}>:<{value}> | <{end}> [OR] <{sortloop foo as bar on name}><{name}>:<{bar}> | <{end}>
	//will render:
	0:3 | 1:1 | 2:4 | 3:5 | 4:2 | 5:6 | 

A final "descending" parameter can be added to the end of any sort loop to, obviously, order in descending order rather than ascending 
(which is default).
	
	//where foo = [3,1,4,5,2,6]
	<{sortloop foo descending}><{name}>:<{value}> | <{end}> [OR] <{sortloop foo as bar descending}><{name}>:<{bar}> | <{end}>
	//will render:
	5:6 | 3:5 | 2:4 | 0:3 | 4:2 | 1:1 | 
	//where foo = [3,1,4,5,2,6]
	<{sortloop foo on name descending}><{name}>:<{value}> | <{end}> [OR] <{sortloop foo as bar on name descending}><{name}>:<{bar}> | <{end}>
	//will render:
	5:6 | 4:2 | 3:5 | 2:4 | 1:1 | 0:3 | 

Sortloop will sort things alphabetically as well.

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
		<{if __index == 1}><{continue}><{end}>
		<{bar}>
	<{end}>
	//Will render as:
	baz
	
	bar