# Javascript NodeJS

You can setup tracing for your Node.js application. Check sample configuration on how to setup traces.

##Clone </br>
```

git clone https://github.com/openobserve/sample-tracing-nodejs-javascript

```

If you don't have node.js installed, please install it and then follow below steps.

Open `tracing.js` file from that repository. and make changes to the highlighted lines below
```javascript linenums="1" hl_lines="17 19"

const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new opentelemetry.NodeSDK({
  // traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    url: "https://api.openobserve.ai/api/default/v1/traces",
    headers: {
      Authorization: "Authorization",
    },
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: "nodejs-javascript-service",
});

sdk.start();
```
</br>
##Setup up credentials </br>

You will get `url` and `Authorization` key here [http://cloud.openobserve.ai/ingestion/traces/](http://cloud.openobserve.ai/ingestion/traces/)

Replace the `url` and `Authorization` key in the `tracing.js` file

##Setup Service/Application </br>
Run commands
```

npm install

```
```

node --require './tracing.js' app.js

```

The server is now running on 8080, navigate to [http://localhost:8080](http://localhost:8080) </br>
Refresh page couple of times to get more traces exported.

![Traces Sample Configration](./images/sample_configuration.png)
</br>
</br>

Traces are captured, you can check these captured traces here [https://cloud.openobserve.ai/traces](https://cloud.openobserve.ai/traces)
</br>

![Traces Page](./images/traces_js.png)
</br>
</br>

Filter traces with your service name `nodejs-javascript-service`
</br>

![Filter traces with service name](./images/filter_traces_js.png)

Click on any trace to check trace data

![Trace details](./images/trace_details_1.png)

Trace can have multiple spans, each span represents single operation or task within that trace. Click on any span to check span details.

![Trace details](./images/trace_details_2.png)
