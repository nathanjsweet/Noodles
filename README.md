Noodles Templating System
========================
###Created by Nathan Sweet
Introduction
------------
Noodles is a high-performance template language written in JavaScript. It is written
using requirejs, so it can be used both on the server and on the client. It is meant
to be platform agnostic, with an aim to be as a portable as possible, to be as
compact as possible.

Noodles is compact and could be used to on the front end to render templates that have a little too much logic in them,
to allow native JavaScript to control their logic in a readable way.

The language goals of Noodles syntax are to allow for as much permissiveness, readability, and colloquialism as possible. The language
is written so that the server of the template should not be adversely affected by a poorly written template.
The templating engine won't freak out over mistakes and will gloss over them as best as possible, while still
providing a warning system that can be viewed if the writer of the template wishes. The goal of the engine of the Noodles language,
is to offer the most high-performance engine possible with the overarching goal of making plugins as easy to write
as possible.