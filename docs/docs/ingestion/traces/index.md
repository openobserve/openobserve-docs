# Index

ZincObserve follows opentelemtry standards for traces. You can send traces to ZincObserve using code instrumented via opentelemtry SDKs or via auto-instrumentation to send traces to ZincObserve.


Endpoint for sending traces to ZincObserve is 

### Zinc Cloud

> `https://api.zincobserve.com/api/<orgname>/traces`

e.g. `https://api.zincobserve.com/api/default/traces`

### Self hosted ZincObserve
> `https://url:5080/api/<orgname>/traces`

### Credentials
You must send credentials via Authorization Header.

e.g. 

for credentials:

```
userid: root@example.com
password: Complexpass#123
```

```shell
echo -n root@example.com:Complexpass#123 | base64
```

`cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=`

Header should be:

```
Authorization: Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
```


