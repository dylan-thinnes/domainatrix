# Domainatrix
"Keeping track of the hellscape that is the University of Edinburgh's DNS, one simple submit at a time."
Github Repository: https://www.github.com/dylan-thinnes/domainatrix
Website: https://domainatrix.me
## What it is
Domainatrix is a simple, slightly humorous project which allows users to submit and peruse the extensive and often bewildering DNS of the university of Edinburgh. It keeps a combined record of all domains with a DNS record and allows them to check http and ping statuses of each domain at a glance.
## How it works
NodeJS runs the server which tracks different requests to API endpoints to either modify or withdraw data for the user. It stores this data persistently on disk so that the same data is available constantly to all users.  
The client-side allows dynamic updates of the visuals for this data through a simple, (generally) lightweight GUI.
## Plans
### Easier Filtering
Filtering utilities on the client are currently limited to just names and for moderate functionality require knowledge of JavaScript Regular Expression syntax. Inserting a few buttons and instructions on usage (such as implicit ed.ac.uk extensions) would open the site up to exploration.
### Extensive Metadata
Keeping track of more interesting information, such as last HTTP response code and DNS IP address resolution. 
### Batch Checking Interface
A new API endpoint and corresponding interface design for handling multiple simultaneous candidacy requests from one user.
### Smarter DNS Exploration
Makes use of a few specialized techniques to try and find more domains after it is given one. Examples include:
 - HTTP redirects
 - Checking CNAME for further resolution
 - Reverse DNS lookup on A records
 - Checking other domains under the current one e.g. a.b.c.ed.ac.uk, b.c.ed.ac.uk, c.ed.ac.uk, skipping nodes that it has checked, until it reaches the root ed.ac.uk
 - Checking certificate issuers
### API Enhancement and Documentation
Documentation for the API as it stands is zilch, even though we have only 4 endpoints. Offering more endpoints and customization of requests, and some documentation to explain it, could go a long way towards adoption.
### Adapt for Other Universities and Domains
Many other sites exist with absurd amounts of subdomains, especially other university students. Maybe they'd get a kick out of it too.
### Migrate to Other Database
SQLite has issues with scaling and can be finicky through NodeJS. Moving to AbstractDB would offer me the incentive to write other databases into the library and to learn them.

## Documentation
### API (v1)
There are 7 endpoints. Aside from `/v1/domains` and `/v1/domains/{domain name}`, they are not idempotent. They all return JSON.
The API is built on the notion of "states", which express in what way the value has currently been resolve or not resolved.

**`GET /v1/domains`**
Returns the list of all domains that are currently in storage and their associated metadata. In effect, this is a `/all` call to all domains on storage. Used for initial population of the database.

**`POST /v1/domains`**
Used to request the addition of a domain name to the database. The requested domain's URL is posted in the `name` parameter.
Returns a non-zero positive `state` if the domain does not have a DNS entry. If `state` is 0, it returns additional data and the domain gets committed to the database server-side.

**`GET /domains/{domainName}`**
Returns only once dns, ping, http, and children can all be accounted for and returned. Does not run any rechecks, unlike the previous 4 endpoints.

**`GET /v1/domains/{domain name}/dns`**
**`GET /v1/domains/{domain name}/ping`**
**`GET /v1/domains/{domain name}/http`**
Requests that the server update the DNS, ping, or HTTP status of the given domain name. Returns a non-zero positive `state` if the domain has no entry in the database. If the `state` is 0, an additional `value` property is given. A `lastUpate` property is always added, unless `state` is -2. 
The values of `value` are as follows for endpoints:
`dns`: The domain's list of DNS records, formatted as an array containing Objects with record `type` and record `value` as entries. 
`ping`: Ping latency in milliseconds.
`http`: HTTP status code returned.

**`GET /v1/domains/{domain name}/children`** **[PLANNED]**
Returns the given value's domains that were found using smarter DNS exploration listed in plan #4.
### Code Structure
#### Server (Under Construction)
#### Database (Under Construction)

