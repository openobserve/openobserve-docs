# Index

ZincObserve follows opentelemtry standards for traces. You can send traces to ZincObserve using code instrumented via opentelemtry SDKs or via auto-instrumentation to send traces to ZincObserve.


Endpoint for sending traces to ZincObserve is 

### Zinc Cloud

> `https://api.zincobserve.com/api/<orgname>/traces`

### Self hosted ZincObserve
> `https://url:5080/api/<orgname>/traces`

You must send credentials via Authorization Header.


e.g. `https://api.zincobserve.com/api/default/traces`
