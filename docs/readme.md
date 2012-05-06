Documentation
========================
Introduction
------------
The documentation system for Noodles is extremely simple to use and modify.
	
	sudo node docs/index.js

This will create a server that will create all the documentation for all the core Noodles engine, as well as any of the plugins that are currently installed and listen for the domain "noodles/". Each plugin has a readme file that gets pulled into the documentation and converted into html for the docs.

More documentation will come on getting the doc system to do more complicated things, but the node server written for the system is not complicated or long (it's just one file) and should be pretty easy to figure out for someone who wants it to get to do some more complicated things. One easy next step for any user of this doc system would be to get the doc server to save all of the files that it generates in it's memory (the files are not saved and die with the process's memory allocation as soon as the server process is killed).