If
---
The if tag is the primary flow-control tag in Noodles. It can do a lot. It is primarily useful in evaluating a set of conditions and rendering text on those sets of conditions. Within the if tag the keywords "and" and "or" can be used to delimit sets of conditions within one if statement. Similar to most programming languages conditions are separated by "or"s first and groups of "and"s are evaluated together first. Notice that objects can be compared to other objects or strings.
	
	<{if foo == bar and foo contains "bar" or bar contains foo}>
		some text to render
	<{elseif foo == "bar"}>
		some other text to render
		<{if bar startswith "foo"}>render this<{end}>
	<{else}>
		text to render it no condition is met
	<{end}>
As you may notice the if statement also supports subsequent "elseif" and "else" statements to keep control-flow as compact as possible. As you may have also noticed the if statement supports different sets of boolean evaluations. Here is a comprehensive list of them via examples:
	
	<{if foo}>
	//if foo, as an object, exists
	<{if !foo}>
	//if foo, as an object, does not exist
	<{if foo == "bar"}>
	//if string equality is true, this comparison is case-insensitive
	<{if foo !== "bar"}>
	//if string equality is untrue, this comparison is case-insensitive,
	//so "bar" != "BAR" will evaluate as false
	<{if foo contains "bar"}>
	//if a string contains a given substring, this is case-insensitive
	<{if foo startswith "bar"}>
	//if a string starts with a given substring, this is case-insensitive
	<{if foo endswith "bar"}>
	//if a string ends with a given substring, this is case-insensitive
	<{if count > -1}>
	//if a number is greater than some other number
	<{if count < 1}>
	//if a number is less than some other number
	<{if count >= 1.5}>
	//if a number is greater than or equal to some other number
	<{if count <= -1.5}>
	//if a number is less than or equal to some other number
	<{if something matches reBaz}> OR <{if something matches "^\s+|\s+$"}>
	//This last one is somewhat complex and will only worked if executed appropriately.
	//The left side of the comparison must be a string or an object that refers to a string.
	//The right side of the comparison must be either a RegularExpression object of a string (or an object pointing to),
	//if a string is provided on the right side it will be evaluated to a Regular Expression.
	//The expression itself tests whether the left side of the expression matches the,
	//Regular Expression on the right side. The JavaScript Regular Expression is what is used,
	//to create the regular expression. HOWEVER, like all of the string comparisons, this will
	//always be case insensitive
	
Notice that all string comparisons are case-insensitive, notice also that you can use objects to refer to strings so 'foo == "bar"' will
evaluate the exact same as 'foo == baz' if baz refers to "bar". Also note that all of these comparisons can be strung together with other comparisons using "or" and "and".