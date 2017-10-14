# domainatrix
"Keeping track of the hellscape that is the University of Edinburgh's DNS, one submit at a time."
[domainatrix.me](http://domainatrix.me)

## What it is
Domainatrix is a simple, slightly humorous project which allows users to submit and peruse the extensive and often bewildering DNS of the university of Edinburgh. It keeps a combined record of all domains with a DNS record and allows them to check http and ping statuses of each domain at a glance.

## How it works
NodeJS runs the server which tracks different requests to API endpoints to either modify or withdraw data for the user. It stores this data persistently on disk so that the same data is available constantly to all users.  
The client-side allows dynamic updates of the visuals for this data through a simple, (generally) lightweight GUI.

## Plans for the future
Check the issues for enhancements that are planned for the project. In general, however, four main improvements are in mind:  
- Allow descriptions to be added about each domain
- Keep historic constantly updated logs about each domain (requires DB upgrade, especially)
- Better filtering and sorting
- Record domains from outside the \*.ed.ac.uk pattern

This list is by no means exhaustive. Other, smaller, incremental improvements are being thought up often.
