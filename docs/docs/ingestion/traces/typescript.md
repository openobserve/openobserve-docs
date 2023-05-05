# Typescript

You can setup tracing for your Node.js Typescript application. Check sample configuration on how to use these tools by following the links.

##Clone </br>
```

git clone https://github.com/zinclabs/sample-tracing-nodejs-typescript

```

If you don't have node.js installed, please install it and then follow below steps.

Open tracing.js file from that repository.
```typescript linenums="1" hl_lines="13 15"

import  *  as  opentelemetry  from  "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from  "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from  "@opentelemetry/api";
import { OTLPTraceExporter } from  "@opentelemetry/exporter-trace-otlp-http";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG

diag.setLogger(new  DiagConsoleLogger(), DiagLogLevel.INFO);

const  sdk = new  opentelemetry.NodeSDK({
    // traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
    traceExporter:  new  OTLPTraceExporter({
        url: "https://observe.zinc.dev/api/default/traces",
        headers: {
            Authorization: "Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=",
        },
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName:  "nodejs-typescript-service",
});

sdk.start();
```
</br>
##Setup up credentials </br>

`url: https://observe.zinc.dev/api/default/traces`  is where traces will be exported.</br>
Replace `Authorization` value if you have changed default password. Check `Credentials` section from [Traces](./index.md#credentials) page.

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

![Traces Sample Configration](../../images/ingestion/traces/sample_configuration.png)
</br>
</br>

Navigate to `https://observe.zinc.dev/web/traces`
</br>

![Traces Page](../../images/ingestion/traces/traces_page.png)
</br>
</br>

Filter traces with your current service name `nodejs-typescript-service`
</br>

![Filter traces with service name](../../images/ingestion/traces/traces_with_service_name.png)
