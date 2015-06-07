var winston   	= require('winston');

//1.21.4   0.8.3    0.10

require('winston-loggly');


module.exports =  function(options) {
	var self = this;

	this.logger = new (winston.Logger)();

	//Log to file
	if (options && options.filePath){
		if (options.handleExceptions){
			this.logger.add(winston.transports.File, {
				filename: options.filePath,
				handleExceptions: true
			});
		}
		else {
			this.logger.add(winston.transports.File, {
				filename: options.filePath,
				json: false
			});
		}
	}
	else if (options && options.fileName){
		if (options.handleExceptions){
			this.logger.add(winston.transports.File, {
				filename: __dirname + '/' + options.fileName,
				handleExceptions: true
			});
		}
		else {
			this.logger.add(winston.transports.File, {
				filename: __dirname + '/' + options.fileName
			});
		}
	}

	//Log to console
	if (!options || options.console){
		if (options && options.handleExceptions){
			this.logger.add(winston.transports.Console, {
				handleExceptions: true
			});
		}
		else{
			this.logger.add(winston.transports.Console);
		}
	}

	//Log to loggly
	if (options && options.loggly){
		this.logger.add(winston.transports.Loggly, {
			subdomain: options.loggly.subdomain,
			inputToken: options.loggly.inputToken,
			json: true
		});
	}


	this.logger.exitOnError = true;

	this.log = function() {
		self.logger.log.apply(self.logger, arguments);
	};
};