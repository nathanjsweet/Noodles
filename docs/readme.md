Documentation
========================
Introduction
------------
The documentation system for Noodles is extremely simple to use and modify. For reasons not worth going into, you CANNOT build while inside of the docs folder, you must be in front of it.
	
	sudo node docs/buildDocs.js

This will create all the relevant documentation for all the core Noodles engine, as well as any of the plugins that are currently installed. Each plugin has a readme file that gets pulled into the documentation and converted into html for the docs.

In order to run a simple server that will serve out the documentation as a cohesive website simply run the index file, or a point a simple file server (like apache) at the docs/files folder:
	
	sudo node docs/index.js