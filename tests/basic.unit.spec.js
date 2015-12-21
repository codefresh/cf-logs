var proxyquire = require('proxyquire').noCallThru();
var Q          = require('q');
var chai       = require('chai');
var expect     = chai.expect;
var sinon      = require('sinon');
var sinonChai  = require('sinon-chai');
chai.use(sinonChai);
var cflogs    = require('../lib/index');


beforeEach(function () {
    process.env.DEBUG = "";
});

describe('setGlobalOptions - sets the options object from which all future loggers will initialize', function () {

    describe('positive', function () {

        it('should succeed when not providing any options', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({});
                });
        });

        it('should succeed when providing loggly with subdomain and inputToken', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({loggly: {subdomain: "sub", inputToken: "token"}});
                });
        });

        it('should succeed when providing allowed level', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({level: "error"});
                });
        });

        it('should succeed when providing allowed level', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({level: "warn"});
                });
        });

        it('should succeed when providing allowed level', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({level: "info"});
                });
        });

        it('should succeed when providing allowed level', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({level: "debug"});
                });
        });

    });

    describe('negative', function () {

        it('should fail when providing loggly without any inner options', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({loggly: {}});
                })
                .then(function () {
                    throw new Error("should have failed");
                }, function (err) {
                    expect(err.toString()).to.contain("subdomain was not provided");
                });
        });

        it('should fail when providing loggly without inputToken field', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({loggly: {subdomain: "sub"}});
                })
                .then(function () {
                    throw new Error("should have failed");
                }, function (err) {
                    expect(err.toString()).to.contain("inputToken was not provided");
                });
        });

        it('should fail when providing loggly without subdomain field', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({loggly: {inputToken: "token"}});
                })
                .then(function () {
                    throw new Error("should have failed");
                }, function (err) {
                    expect(err.toString()).to.contain("subdomain was not provided");
                });
        });

        it('should fail when providing level which is not a string', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({level: {}});
                })
                .then(function () {
                    throw new Error("should have failed");
                }, function (err) {
                    expect(err.toString()).to.contain("debug must be a string");
                });
        });

        it('should fail when providing level not allowed value', function () {
            return Q()
                .then(function () {
                    cflogs.setGlobalOptions({level: "notallowed"});
                })
                .then(function () {
                    throw new Error("should have failed");
                }, function (err) {
                    expect(err.toString()).to.contain("debug can only be one of ");
                });
        });

    });

});

describe('create new logger - creates a new namespace that can be enabled/disabled according to env variable', function () {

    describe('positive', function () {

        it('should succeed in creating a new logger with namespace param', function () {
            return Q()
                .then(function () {
                    var logger = cflogs.Logger("namespace");
                });
        });

    });

    describe('negative', function () {

        it('should fail when not passing a string', function () {
            return Q()
                .then(function () {
                    var logger = cflogs.Logger({});
                })
                .then(function () {
                    throw new Error("should have failed");
                }, function (err) {
                    expect(err.toString()).to.contain("namespace must be a String");
                });
        });

    });

});

describe('using DEBUG environment variable', function () {

    var addSpy, logSpy, errorSpy, warnSpy, infoSpy, debugSpy;
    var proxyLogger;

    beforeEach(function(){
        addSpy = sinon.spy();
        logSpy = sinon.spy();
        errorSpy = sinon.spy();
        warnSpy = sinon.spy();
        infoSpy = sinon.spy();
        debugSpy = sinon.spy();

        proxyLogger = proxyquire('../lib/index', {
            'winston': {
                transports:{
                    File: "",
                    Console: "",
                    Loggly: ""
                },
                Logger: function(){
                    return {
                        level: "",
                        add: addSpy,
                        log: logSpy,
                        error: errorSpy,
                        warn: warnSpy,
                        info: infoSpy,
                        debug: debugSpy
                    };

                }
            }
        });
    });

    describe('log', function(){
        it('should not print anything when DEBUG is not set', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("namespace");
                    logger.log("info", "message");
                    expect(logSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh");
                    logger.log("info", "message");
                    expect(logSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh:namespace");
                    logger.log("info", "message");
                    expect(logSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should not print in case DEBUG is set but not match the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "someothernamespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.log("info", "message");
                    expect(logSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG is set and matches the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "namespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.log("info", "message");
                    expect(logSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });
    });

    describe('error', function(){
        it('should not print anything when DEBUG is not set', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("namespace");
                    logger.error("error");
                    expect(errorSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh");
                    logger.error("error");
                    expect(errorSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh:namespace");
                    logger.error("error");
                    expect(errorSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should not print in case DEBUG is set but not match the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "someothernamespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.error("error");
                    expect(errorSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG is set and matches the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "namespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.error("error");
                    expect(errorSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });
    });

    describe('warn', function(){
        it('should not print anything when DEBUG is not set', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("namespace");
                    logger.warn("warn");
                    expect(warnSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh");
                    logger.warn("warn");
                    expect(warnSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh:namespace");
                    logger.warn("warn");
                    expect(warnSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should not print in case DEBUG is set but not match the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "someothernamespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.warn("warn");
                    expect(warnSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG is set and matches the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "namespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.warn("warn");
                    expect(warnSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });
    });

    describe('info', function(){
        it('should not print anything when DEBUG is not set', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("namespace");
                    logger.info("info");
                    expect(infoSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh");
                    logger.info("info");
                    expect(infoSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh:namespace");
                    logger.info("info");
                    expect(infoSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should not print in case DEBUG is set but not match the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "someothernamespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.info("info");
                    expect(infoSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG is set and matches the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "namespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.info("info");
                    expect(infoSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });
    });

    describe('debug', function(){
        it('should not print anything when DEBUG is not set', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("namespace");
                    logger.debug("debug");
                    expect(debugSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh");
                    logger.debug("debug");
                    expect(debugSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', function () {
            return Q()
                .then(function () {
                    var logger = proxyLogger.Logger("codefresh:namespace");
                    logger.debug("debug");
                    expect(debugSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });

        it('should not print in case DEBUG is set but not match the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "someothernamespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.debug("debug");
                    expect(debugSpy).to.have.not.been.called; // jshint ignore:line
                });
        });

        it('should print in case DEBUG is set and matches the namespace', function () {
            return Q()
                .then(function () {
                    process.env.DEBUG = "namespace";
                    var logger = proxyLogger.Logger("namespace");
                    logger.debug("debug");
                    expect(debugSpy).to.have.been.calledOnce; // jshint ignore:line
                });
        });
    });

});