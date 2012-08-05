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