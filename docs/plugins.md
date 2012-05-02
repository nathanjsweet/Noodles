Plugins
========================
Introduction
------------
Along with "tags", plugins can provide certain sets of functionality for Noodles. In order to utilize any of these plugins, it is necessary to declare your intent to use them in the meta-data area of your template, using a comma-separated list:
	
	plugins = foo,bar
Plugins can do a number of things. Many plugins simply provide a set of tags that can be used like "date", or "set", to provide additional functionality to the Noodles runtime, but some plugins might do special things the the page before it is compiled, or right before it's executed. These plugins will inform you in this document about the special things they may do, or the new set of syntax they may provide.