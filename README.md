[![Coverage Status](https://coveralls.io/repos/github/codefresh-io/cf-logs/badge.svg?branch=develop)](https://coveralls.io/github/codefresh-io/cf-logs?branch=develop)

# Codefresh logging library
This library is a wrapper of winston logging library that adds additional beheaviour dedicated for our use.

## Basic Usage - default logger
```javascript
var logger = require('cf-logs');

logger.info("info message");
logger.error("error message");
```
Notice that if you use this option then you will not be able to use the DEBUG environment variable to filter these logs. <br />
So our main use should be with the advanced usage.

## Advanced Usage - specific namespaced logger
You can provide a namespace for your current logger, just like in 'debug' module and then controll the output logs with DEBUG environment variable <br />
```javascript
var logger = require('cf-logs').Logger("codefresh:example");

logger.info("info message");
logger.debug("debug meesage"):
```
This is very powerfull for development, because many times you want to see only logs from a specific part of the application so you can for example set the DEBUG environment variable to for example: "codefresh:builds". <br />
The default is set so that all logs that begins with a namespace 'codefresh,codefresh:*' will be shown.
### Logging Errors
```javascript
var logger = require('cf-logs').Logger("codefresh:example");

var error = new Error("very bad error");
logger.error("error: %s", error.toString());
logger.error("stack: %s", error.stack);
```

## Configuring the logger
The options that can be passed are:
```javascript
var options = {
  filePath: String,
  console: Boolean,
  loggly:{
    subdomain: String,
    inputToken: String
  },
  showNamespace: Boolean,
  env_module: String,
  showRequestId: Boolean,
  level: String(one of: "error/warn/info/debug"),
  consoleOptions: {
      formatter: function(options) {
          // Receives the consoleOptions object, merged with the meta objects
          // Should return a formatted string for this log.
          // This is an example:
          return new Date().toISOString() +' '+ options.level.toUpperCase() +' >> '+ (undefined !== options.message ? options.message : '') +
                                    (options.meta && Object.keys(options.meta).length ? ' << ' + JSON.stringify(options.meta) : '' );
      }
  }
}

var logger = require('cf-logs');
logger.setGlobalOptions(options);
```
### Logging to file
Set 'filePath' field to an absolute path to a file save the logs to a file.
The default is set to null which means no logging to file will happen.
### Logging to console
Set 'console' filed to true or false to log to the console.
The default is set to true
### Logging levels
The logging level is an additional filter that can be set, mainly for production usage.
we have 4 levels, from highest to lowest priority:<br />
1. error <br />
2. warn <br />
3. info <br />
4. debug <br />
If not set, the default logging level is 'debug'. <br />
For example: if we set the logging level to warn, then only error and warn logs will be handled. info and debug will not be handled.
### Showing namespace
Set 'showNamespace' field to true or false to show the namespace in the logs
The default is false
### Global name to the logger
You can set 'env_module' field to a name that will be shown on all logs. for example: "cf-api-machine-1"
The default is set to null which will not print anything
### Show request id 
Set 'showRequestId' field to true or false to show the current request id if exists
The default is set to false
