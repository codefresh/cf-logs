/* eslint-disable no-plusplus,node/no-unsupported-features */
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
    CompositePropagator,
    W3CBaggagePropagator,
    W3CTraceContextPropagator,
} = require("@opentelemetry/core");
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { NodeTracerProvider, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const { BaggageSpanProcessor } = require('@opentelemetry/baggage-span-processor');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { HostMetrics } = require('@opentelemetry/host-metrics');
const {
    LoggerProvider,
    BatchLogRecordProcessor,
} = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { logs } = require('@opentelemetry/api-logs');
const api = require('@opentelemetry/api');
const {
    SEMRESATTRS_SERVICE_NAME,
} = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');

/* Shared configuration */
//  remove from list to enable instrumentation
const disabledStuff = [
    'tedious',
    'undici',
    'pino',
    'mysql2',
    'mysql',
    'knex',
    'koa',
    'hapi',
    'generic-pool',
    'fastify',
    'connect',
    'bunyan',
    'cassandra-driver',
    'aws-lambda'
];
const exporterOptions = {
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 1, // an optional limit on pending requests
};
const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'node-service',
});
/* Metrics configuration */
const readers = [
    new PrometheusExporter()
];
if (process.env.CF_OTEL_OTLP_METRICS_EXPORTER === 'true') {
    readers.push(
        new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({ ...exporterOptions }),
            exportIntervalMillis: 1000,
        }));
}
const meterProvider = new MeterProvider({
    resource,
    readers
});
if (process.env.CF_OTEL_HOST_METRICS_ENABLED === 'true') {
    const hostMetrics = new HostMetrics({ meterProvider, name: 'service-host-metrics' });
    hostMetrics.start();
}
/* Tracing configuration */
const traceProvider = new NodeTracerProvider({
    resource
});
traceProvider.addSpanProcessor(
    new BatchSpanProcessor(new OTLPTraceExporter({ ...exporterOptions }))
);
traceProvider.addSpanProcessor(
    new BaggageSpanProcessor()
);
/* Propagation configuration */
const propagator = new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
});
traceProvider.register({
    propagator
});

/* Logger configuration */
if (process.env.CF_OTEL_OTLP_LOGS_EXPORTER === 'true') {
    const loggerProvider = new LoggerProvider({
        resource
    });
    loggerProvider.addLogRecordProcessor(
        new BatchLogRecordProcessor(new OTLPLogExporter({ ...exporterOptions }))
    );
    logs.setGlobalLoggerProvider(loggerProvider);
}

api.metrics.setGlobalMeterProvider(meterProvider);
api.propagation.setGlobalPropagator(propagator);
api.trace.setGlobalTracerProvider(traceProvider);
registerInstrumentations({
    instrumentations: [
        getNodeAutoInstrumentations(
            disabledStuff.reduce((result, item) => {
                result[`@opentelemetry/instrumentation-${item}`] = { enabled: false };
                return result;
            }, {})
        ),
    ],
});

