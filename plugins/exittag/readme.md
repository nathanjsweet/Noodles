Exit
----
"Exit" is a special tag which simply allows you to exit the current execution of a template and only allow everything before the "exit" tag to render:
	
	<{if !user.name}>
	Invalid user name and/or password.
	<{exit}>
	<{end}>
	<html>
		<head>
		</head>
		<body>
		.
		.
		.
	//will render:
	
	Invalid user name and/or password.
	
