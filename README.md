Noodles Templating System
========================
###Created by Nathan Sweet
Introduction
------------
Noodles is a high-performance template language written in JavaScript. It is written
using requirejs, so it can be used both on the server and on the client. It is platform agnostic so that it may
be as a portable as possible.

Noodles is relatively compact and could be used to on the front end to render templates that have a little too much logic in them,
to allow native JavaScript to control their logic in a readable way. Or it could be used as part of a client MVC to minimize refactoring
code in the transfer of "Views" from the server to the client (and visa versa).

The language goals of Noodles syntax are to be as permissive, readable, and colloquial as possible. The language
is written so that the server of the template should not be adversely affected by a poorly written template.
The templating engine won't break over mistakes and will gloss over them as best as possible, while still
providing a warning system that can be viewed if the writer of the template wishes.

Performance
------------
It's performance is more than a little impressive. Compile time, though usually not important, is still quite fast (usually less than 20 milliseconds). Medial string values between data access affect performance quite negligibly, so
if you have a large template, but with little logic, you can rest assured that you will have just as fast performance if you had a minimal amount
of text. As for rendering time: on node, a template which has to do object access about 100 times (more than the average template  will probably have) sees some impressive speed. Here is a sample run (see tests/node-test.js):

	The mean time was:  1586.0815 μs (1.5 milliseconds).
	The median time was: 1538 μs (1.5 milliseconds).
	The upper bound time was:  16943 μs (16 milliseconds).
	The lower bound time was:  1500 μs(1.5 milliseconds).
	The standard deviation was: 1673.9541218916183 μs (1.6 milliseconds).
	The number of runs was:  10,000.

On templates that see more typical object access (sub 50 iterations) the times can be as low as 100 microseconds. Singular object access seems to take about 10-20 microseconds. These times will most likely be an improvement on most templating systems, and will certainly never be an issue on the client.