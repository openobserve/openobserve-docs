## curl

### Single record

```shell
curl http://localhost:5080/api/default/quickstart1/_json -i -u root@example.com:Complexpass#123 -d '[{"author":"Prabhat Sharma"}]'
```

### Large number if records from a file

For the [sample file](ttps://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip). You can use the below command.

```shell
curl http://localhost:5080/api/default/quickstart1/_json -i -u root@example.com:Complexpass#123 --data-binary "@k8slog_json.json"
```
