Set
----
The Set tag is used to set a variable name to some value, it can be used to create a new variable or object, or to replace the value of an existing variable or object. In the simplest form a value is set to be equal to either a string, a number, or another object:
	
	//Given that foo = "bar"
	<{set bar = "foo"}>
	<{set baz = foo}>
	<{set one = 1}>
	//Now bar = "foo", baz = "bar", and one is equal to the integer 1
	//Baz equals bar because it is equal to the value of foo; if foo is changed it will not change it's value

Setalist
--------
The "Setalist" tag, which is simply a sub-tag of "Set" is used to specifically and only set a list of items equal to some variable or object, or to replace the value of an existing variable or object. This list can contain a mixed set of types. Lists can be looped over:
	
	//Given that foo = "bar"
	<{setalist mylist = "baz",foo,1,"bar"}>
	<{loop mylist as item}>
		<{item}>
	<{end}>
	//Will render:
	baz
	bar
	1
	bar
Addtolist
---------
The "Addtolist" tag, which is simply a sub-tag of "Set" is used to specifically and only add a value to an existing list. If the tag accidentally tries to set a value to a non-list the tag will silently fail. The tag can add either an object, number, or string to an existing list:
	
	//Given that foo = "bar"
	<{setalist mylist = "baz",foo,1,"bar"}>
	<{addtolist "wham!" to mylist}>
	<{loop mylist as item}>
		<{item}>
	<{end}>
	//Will render:
	baz
	bar
	1
	bar
	wham!
Setahash
--------
The "Setahash" tag, which is simply a sub-tag of "Set" is used to specifically and only set a hash table of items equal to some variable or object, or to replace the value of an existing variable or object. This hash table can contain a mixed set of types. Hash tables can be looped over:
	
	//Given the foo = "bar"
	<{setahash myhash = baz:"bar",foo:foo,one:1,zero:0,empty:""}>
	<{myhash.baz}>
	<{myhash.foo}>
	<{if myhash.one}><{myhash.one}><{end}>
	<{if !myhash.zero}><{myhash.zero}><{end}>
	<{if myhash.empty}><{myhash.empty}><{end}>
	//Will render:
	"bar"
	"bar"
	1
	0

	