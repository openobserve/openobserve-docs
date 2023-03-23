# Etcd

## Enable authentication

TODO

## Enable TLS authentication

TODO

## Maintenance 

```
etcdctl defrag --command-timeout=300s --cluster
etcdctl --write-out=table endpoint status
etcdctl alarm disarm
etcdctl alarm list
```
