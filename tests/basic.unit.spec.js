const proxyquire = require('proxyquire').noCallThru();
const Q = require('q');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const cflogs = require('../lib/index');


beforeEach(() => {
    process.env.DEBUG = "";
});

describe('setGlobalOptions - sets the options object from which all future loggers will initialize', () => {
    describe('positive', () => {
        it('should succeed when not providing any options', () => {
            cflogs.setGlobalOptions({});
        });

        it('should succeed when providing allowed level', () => {
            cflogs.setGlobalOptions({ level: "error" });
        });

        it('should succeed when providing allowed level', () => {
            cflogs.setGlobalOptions({ level: "warn" });
        });

        it('should succeed when providing allowed level', () => {
            cflogs.setGlobalOptions({ level: "info" });
        });

        it('should succeed when providing allowed level', () => {
            cflogs.setGlobalOptions({ level: "debug" });
        });
    });

    describe('negative', () => {
        it('should fail when providing level which is not a string', () => {
            try {
                cflogs.setGlobalOptions({ level: {} });
                expect.fail("should have failed");
            } catch (error) {
                expect(error.toString()).to.contain("debug must be a string");
            }
        });

        it('should fail when providing level not allowed value', () => {
            try {
                cflogs.setGlobalOptions({ level: "notallowed" });
                expect.fail("should have failed");
            } catch (error) {
                expect(error.toString()).to.contain("debug can only be one of ");
            }
        });
    });
});

describe('create new logger - creates a new namespace that can be enabled/disabled according to env variable', () => {
    describe('positive', () => {
        it('should succeed in creating a new logger with namespace param', () => {
            const logger = cflogs.Logger("namespace");
            expect(logger).to.be.ok;
        });
    });

    describe('negative', () => {
        it('should fail when not passing a string', () => {
            try {
                const logger = cflogs.Logger({});
                expect.fail("should have failed");
            } catch (error) {
                expect(error.toString()).to.contain("namespace must be a String");
            }
        });
    });
});

describe('using DEBUG environment variable', () => {
    let addSpy, logSpy, errorSpy, warnSpy, infoSpy, debugSpy;
    let proxyLogger;

    beforeEach(() => {
        addSpy = sinon.spy();
        logSpy = sinon.spy();
        errorSpy = sinon.spy();
        warnSpy = sinon.spy();
        infoSpy = sinon.spy();
        debugSpy = sinon.spy();

        proxyLogger = proxyquire('../lib/index', {
            'winston': {
                transports: {
                    File: sinon.spy(),
                    Console: sinon.spy(),
                },
                format: {
                    combine: sinon.spy(),
                    timestamp: sinon.spy(),
                    printf: sinon.spy()
                },
                createLogger() {
                    return {
                        level: "",
                        add: addSpy,
                        log: logSpy,
                        error: errorSpy,
                        warn: warnSpy,
                        info: infoSpy,
                        debug: debugSpy
                    };
                },
            },
        });
    });

    describe('log', () => {
        it('should not print anything when DEBUG is not set', () => {
            const logger = proxyLogger.Logger("namespace");
            logger.log("info", "message");
            expect(logSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', () => {
            const logger = proxyLogger.Logger("codefresh");
            logger.log("info", "message");
            expect(logSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', () => {
            const logger = proxyLogger.Logger("codefresh:namespace");
            logger.log("info", "message");
            expect(logSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should not print in case DEBUG is set but not match the namespace', () => {
            process.env.DEBUG = "someothernamespace";
            const logger = proxyLogger.Logger("namespace");
            logger.log("info", "message");
            expect(logSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG is set and matches the namespace', () => {
            process.env.DEBUG = "namespace";
            const logger = proxyLogger.Logger("namespace");
            logger.log("info", "message");
            expect(logSpy).to.have.been.calledOnce; // jshint ignore:line
        });
    });

    describe('error', () => {
        it('should not print anything when DEBUG is not set', () => {
            const logger = proxyLogger.Logger("namespace");
            logger.error("error");
            expect(errorSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', () => {
            const logger = proxyLogger.Logger("codefresh");
            logger.error("error");
            expect(errorSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', () => {
            const logger = proxyLogger.Logger("codefresh:namespace");
            logger.error("error");
            expect(errorSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should not print in case DEBUG is set but not match the namespace', () => {
            process.env.DEBUG = "someothernamespace";
            const logger = proxyLogger.Logger("namespace");
            logger.error("error");
            expect(errorSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG is set and matches the namespace', () => {
            process.env.DEBUG = "namespace";
            const logger = proxyLogger.Logger("namespace");
            logger.error("error");
            expect(errorSpy).to.have.been.calledOnce; // jshint ignore:line
        });
    });

    describe('warn', () => {
        it('should not print anything when DEBUG is not set', () => {
            const logger = proxyLogger.Logger("namespace");
            logger.warn("warn");
            expect(warnSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', () => {
            const logger = proxyLogger.Logger("codefresh");
            logger.warn("warn");
            expect(warnSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', () => {
            const logger = proxyLogger.Logger("codefresh:namespace");
            logger.warn("warn");
            expect(warnSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should not print in case DEBUG is set but not match the namespace', () => {
            process.env.DEBUG = "someothernamespace";
            const logger = proxyLogger.Logger("namespace");
            logger.warn("warn");
            expect(warnSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG is set and matches the namespace', () => {
            process.env.DEBUG = "namespace";
            const logger = proxyLogger.Logger("namespace");
            logger.warn("warn");
            expect(warnSpy).to.have.been.calledOnce; // jshint ignore:line
        });
    });

    describe('info', () => {
        it('should not print anything when DEBUG is not set', () => {
            const logger = proxyLogger.Logger("namespace");
            logger.info("info");
            expect(infoSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', () => {
            const logger = proxyLogger.Logger("codefresh");
            logger.info("info");
            expect(infoSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', () => {
            const logger = proxyLogger.Logger("codefresh:namespace");
            logger.info("info");
            expect(infoSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should not print in case DEBUG is set but not match the namespace', () => {
            process.env.DEBUG = "someothernamespace";
            const logger = proxyLogger.Logger("namespace");
            logger.info("info");
            expect(infoSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG is set and matches the namespace', () => {
            process.env.DEBUG = "namespace";
            const logger = proxyLogger.Logger("namespace");
            logger.info("info");
            expect(infoSpy).to.have.been.calledOnce; // jshint ignore:line
        });
    });

    describe('debug', () => {
        it('should not print anything when DEBUG is not set', () => {
            const logger = proxyLogger.Logger("namespace");
            logger.debug("debug");
            expect(debugSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh', () => {
            const logger = proxyLogger.Logger("codefresh");
            logger.debug("debug");
            expect(debugSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should print in case DEBUG env variable is not set and using namespace codefresh:{something}', () => {
            const logger = proxyLogger.Logger("codefresh:namespace");
            logger.debug("debug");
            expect(debugSpy).to.have.been.calledOnce; // jshint ignore:line
        });

        it('should not print in case DEBUG is set but not match the namespace', () => {
            process.env.DEBUG = "someothernamespace";
            const logger = proxyLogger.Logger("namespace");
            logger.debug("debug");
            expect(debugSpy).to.have.not.been.called; // jshint ignore:line
        });

        it('should print in case DEBUG is set and matches the namespace', () => {
            process.env.DEBUG = "namespace";
            const logger = proxyLogger.Logger("namespace");
            logger.debug("debug");
            expect(debugSpy).to.have.been.calledOnce; // jshint ignore:line
        });
    });
});
