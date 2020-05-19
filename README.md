# BBData Admin Webapp

This is a simple Angular 1 webapp built upon the BBData API.
It lets admins manage their user groups, objects and object groups using a simple web interface.


## Prerequisites

* NodeJS (tested using node 12.10.0)
* npm (tested using npm 6.11.3)
* an instance of the BBData API running somewhere

## Install

```bash
# clone 
git clone git@github.com:big-building-data/bbdata-admin-webapp.git
cd bbdata-admin-webapp

# install dependencies using NPM
npm install
```

## Run

To run the webapp, you need to __pass the address of the BBData API__ you want to connect to. For this:
* either pass it as the first argument
* or set the environment variable `API_URL`

You can either use `node` or `npm` to start the server.

Using the commandline argument:
```bash
# using node:
node server.js http://localhost:8080
# using npm:
npm start -- http://localhost:8080
```

Using the environment variable:
```bash
# set the API URL
export API_URL=http://localhost:8080

# using node:
node server.js 
# using npm:
npm start -- http://localhost:8080
```

Finally, to run inside a screen session (useful when deployed on a server):
```bash
screen -dmS webapp node server.js $API_URL
```
