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
logger.error("error message");
```
This is very powerfull for development, because many times you want to see only logs from a specific part of the application so you can for example set the DEBUG environment variable to for example: "codefresh:builds". 
### Configuring the logger
The options that can be passed are:
```javascript
var options = {
  loggly:{
    subdomain: "subdomain_of_loggly_account",
    inputToken: "inputToken_of_loggly_account"
  },
  level: "error/warn/info/debug"
}

var logger = require('cf-logs');
logger.setGlobalOptions(options);
```
The logging level is an additional filter that can be set, mainly for production usage.
we have 4 levels, from highest to lowest priority:<br />
1. error <br />
2. warn <br />
3. info <br />
4. debug <br />
If not set, the default logging level is 'debug'. <br />
For example: if we set the logging level to warn, then only error and warn logs will be handled. info and debug will not be handled.


