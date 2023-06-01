# Python

You can setup tracing for your Python application. Check sample configuration on how to setup traces.

##Clone 

```

git clone https://github.com/zinclabs/sample-tracing-python

```

If you don't have Python3 installed, please install it and then follow below steps.

Open `tracing.py` file from that repository. and make changes to the highlighted lines below
```python linenums="1" hl_lines="17 18"

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


# Service name is required for most backends
resource = Resource(attributes={
    SERVICE_NAME: "python-service"
})

# create a tracer provider
tracer_provider = TracerProvider(resource=resource)

# create an OTLP trace exporter
url = 'HTTP_Endpoint'
headers = {"Authorization": "Authorization"}

exporter = OTLPSpanExporter(endpoint=url, headers=headers)

# create a span processor to send spans to the exporter
span_processor = BatchSpanProcessor(exporter)

# add the span processor to the tracer provider
tracer_provider.add_span_processor(span_processor)

# set the tracer provider as the global provider
trace.set_tracer_provider(tracer_provider)

```
##Setup up credentials 

You will get `url` and `Authorization` key here [http://cloud.openobserve.ai/ingestion/traces/](http://cloud.openobserve.ai/ingestion/traces/)

Replace the `url` and `Authorization` key in the `tracing.py` file

##Setup Service/Application 
Follow the steps given in the sample-tracing-python readme and then start server
```
python3 app.py
```
The server is now running, navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000)

Refresh page couple of times to get more traces exported.

![Traces Sample Configration](./images/python_app.png)



Traces are captured, you can check these captured traces here [https://cloud.openobserve.ai/traces](https://cloud.openobserve.ai/traces)

![Traces Page](./images/traces_python.png)

Filter traces with your service name `python-service`

![Filter traces with service name](./images/filter_traces_python.png)

Click on any trace to check trace data

![Trace details](./images/trace_details_1.png)

Trace can have multiple spans, each span represents single operation or task within that trace. Click on any span to check span details.

![Trace details](./images/trace_details_2.png)
