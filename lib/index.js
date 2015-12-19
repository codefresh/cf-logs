var winston   	= require('winston');
var _			= require('lodash');
require('winston-loggly');

var defaultOptions = {
	filePath: null,
	console: true,
	handleExceptions: false,
	loggly: {
		subdomain: "",
		inputToken: ""
	},
	showNamespace: false,
	env_module: "",
	showRequestId: false,
	level: "debug"
};

var globalOptions = defaultOptions;
var names = [];
var skips = [];

var setGlobalOptions = function(options){
	if (!options){
		throw new Error("failed to set globalOptions because no options object was provided");
	}

	var validOptions = {};

	if (options.loggly){
		if (!options.loggly.subdomain){
			throw new Error("failed to set globalOptions because loggly subdomain was not provided");
		}
		if (!options.loggly.inputToken){
			throw new Error("failed to set globalOptions because loggly inputToken was not provided");
		}
	}
	validOptions.loggly = options.loggly;

	if (options.level){
		if (typeof options.level !== 'string'){
			throw new Error("failed to set globalOptions because debug must be a string");
		}
		var levels = /error|warn|info|debug/;
		if (!levels.test(options.level)){
			throw new Error("failed to set globalOptions because debug can only be one of these values: error/warn/info/debug");
		}
	}
	validOptions.level = options.loggly;

	globalOptions = _.assign(_.cloneDeep(defaultOptions), options);
	defaultLogger.resetLevel();
};

var parseNamespacesFromEnvironment = function parseNamespacesFromEnvironment() {
	var namespaces = process.env.DEBUG;
	var split = (namespaces || '').split(/[\s,]+/);
	var len = split.length;

	for (var i = 0; i < len; i++) {
		if (!split[i]) continue; // ignore empty strings
		namespaces = split[i].replace(/\*/g, '.*?');
		if (namespaces[0] === '-') {
			skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
		} else {
			names.push(new RegExp('^' + namespaces + '$'));
		}
	}
};

var isNamespaceEnabled = function enabled(namespace) {
	var i, len;
	for (i = 0, len = skips.length; i < len; i++) {
		if (skips[i].test(namespace)) {
			return false;
		}
	}
	for (i = 0, len = names.length; i < len; i++) {
		if (names[i].test(namespace)) {
			return true;
		}
	}
	return false;
};

var Logger = function(namespace) {
	if (!namespace){
		throw new Error("failed to create a new logger because namespace was not provided");
	}
	if (typeof namespace !== 'string'){
		throw new Error("failed to create a new logger because namespace must be a String");
	}
	parseNamespacesFromEnvironment();
	var logger = new (winston.Logger)();
	logger.level = globalOptions.level;

	//Log to file
	if (globalOptions && globalOptions.filePath){
		if (globalOptions.handleExceptions){
			logger.add(winston.transports.File, {
				filename: globalOptions.filePath,
				handleExceptions: true
			});
		}
		else {
			logger.add(winston.transports.File, {
				filename: globalOptions.filePath,
				json: false
			});
		}
	}

	//Log to console
	if (!globalOptions || globalOptions.console){
		if (globalOptions && globalOptions.handleExceptions){
			logger.add(winston.transports.Console, {
				handleExceptions: true
			});
		}
		else{
			logger.add(winston.transports.Console);
		}
	}

	//Log to loggly
	if (globalOptions && globalOptions.loggly && globalOptions.loggly.subdomain && globalOptions.loggly.inputToken){
		logger.add(winston.transports.Loggly, {
			subdomain: globalOptions.loggly.subdomain,
			inputToken: globalOptions.loggly.inputToken,
			json: true
		});
	}


	logger.exitOnError = true;

	var addSpecificArguments = function(oldArguments){
		if (isNamespaceEnabled(namespace) || namespace === "CF_LOGS_DEFAULT"){
			var data = {};
			if (globalOptions.showNamespace && namespace !== "CF_LOGS_DEFAULT"){
				data.namespace = namespace;
			}
			if (globalOptions.env_module){
				data.env_module = globalOptions.env_module;
			}
			if (globalOptions.showRequestId && domain && domain.active && domain.active.requestId){
				data.requestId = domain.active.requestId;
			}
			oldArguments.push(data);
		}
		return oldArguments;
	};

	var resetLevel = function(){
		logger.level = globalOptions.level;
	};

	var log = function() {
		var mainArguments = addSpecificArguments(Array.prototype.slice.call(arguments));
		logger.log.apply(logger, mainArguments);
	};
	var error = function(){
		var mainArguments = addSpecificArguments(Array.prototype.slice.call(arguments));
		logger.error.apply(logger, mainArguments);
	};
	var warn = function(){
		var mainArguments = addSpecificArguments(Array.prototype.slice.call(arguments));
		logger.warn.apply(logger, mainArguments);
	};
	var info = function(){
		var mainArguments = addSpecificArguments(Array.prototype.slice.call(arguments));
		logger.info.apply(logger, mainArguments);
	};
	var debug = function(){
		var mainArguments = addSpecificArguments(Array.prototype.slice.call(arguments));
		logger.debug.apply(logger, mainArguments);
	};

	return {
		log: log,
		error: error,
		warn: warn,
		info: info,
		debug: debug,
		Logger: Logger,
		setGlobalOptions: setGlobalOptions,
		init: setGlobalOptions,
		isNamespaceEnabled: isNamespaceEnabled,
		resetLevel: resetLevel
	};
};

var defaultLogger = Logger("CF_LOGS_DEFAULT");
module.exports = defaultLogger;