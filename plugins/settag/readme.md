Set
----
The Set tag is used to set a variable name to some value, it can be used to create a new variable or replace the value of an existing one. In the simplest form a value is set to be equal to either a string, a number, or another object:
	
	//Given that foo = "bar"
	<{set bar = "foo"}>
	<{set baz = foo}>
	<{set one = 1}>
	//Now bar = "foo", baz = "bar", and one is equal to the integer 1
	//Baz equals bar because it is equal to the value of foo; if foo is changed it will not change it's value


