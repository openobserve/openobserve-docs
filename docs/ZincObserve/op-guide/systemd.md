# Systemd

Install ZincObserve as a system service use systemd.

## Create env file

`/etc/zincobserve.env`

```toml
ZO_ROOT_USER_EMAIL = "root@example.com"
ZO_ROOT_USER_PASSWORD = "Complexpass#123"
ZO_DATA_DIR = "/data/zincobserve"
```

## Create systemd service file

`/usr/lib/systemd/system/zincobserve.service`

```toml
[Unit]
Description=The ZincObserve server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=simple
LimitNOFILE=65535
EnvironmentFile=/etc/zincobserve.env
ExecStart=/usr/local/bin/zincobserve
ExecStop=/bin/kill -s QUIT $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Tips:

> `EnvironmentFile` and `ExecStart` should be the config file and zincobserve binary path.

## Enable service

After create env file and service file, you can reload systemed and enable ZincObserve service: 

```shell
systemctl daemon-reload
systemctl enable zincobserve
```

Then, you can use systemctl control ZincObserve as a system service.

#### Start ZincObserve

```shell
systemctl start zincobserve
```

#### Stop ZincObserve

```shell
systemctl stop zincobserve
```

#### Status of ZincObserve

```shell
systemctl status zincobserve
```

#### Test service

```shell
curl -v http://localhost:5080/healthz
```

You will see:

```json
{"status":"ok"}
```
