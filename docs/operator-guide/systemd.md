---
description: >-
  Set up OpenObserve as a systemd service. Learn how to create env and service
  files, enable the service, and manage OpenObserve with systemctl.
---
# Systemd

Install OpenObserve as a system service use systemd.

## Create env file

`/etc/openobserve.env`

```toml
ZO_ROOT_USER_EMAIL = "root@example.com"
ZO_ROOT_USER_PASSWORD = "Complexpass#123"
ZO_DATA_DIR = "/data/openobserve"
```

## Create systemd service file

`/usr/lib/systemd/system/openobserve.service`

```toml
[Unit]
Description=The OpenObserve server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=simple
LimitNOFILE=65535
EnvironmentFile=/etc/openobserve.env
ExecStart=/usr/local/bin/openobserve
ExecStop=/bin/kill -s QUIT $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Tips:

> `EnvironmentFile` and `ExecStart` should be the config file and openobserve binary path.

## Enable service

After create env file and service file, you can reload systemed and enable OpenObserve service: 

```shell
systemctl daemon-reload
systemctl enable openobserve
```

Then, you can use systemctl control OpenObserve as a system service.

#### Start OpenObserve

```shell
systemctl start openobserve
```

#### Stop OpenObserve

```shell
systemctl stop openobserve
```

#### Status of OpenObserve

```shell
systemctl status openobserve
```

#### Test service

```shell
curl -v http://localhost:5080/healthz
```

You will see:

```json
{"status":"ok"}
```
