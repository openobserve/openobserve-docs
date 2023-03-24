# Quickstart

We will do 2 things as part of the quickstart:

1. Install ZincObserve
1. Load sample data and perform search operations on it.

## Installation

You would need ZO_ROOT_USER_EMAIL and ZO_ROOT_USER_PASSWORD environment variables when you start ZincObserve for the first time. You don't need them on subsequent runs of ZincObserve.

=== "Windows"

    Binaries can be downloaded from [releases](https://github.com/zinclabs/zincobserve/releases) page for appropriate platform.


        set ZO_ROOT_USER_EMAIL=root@example.com
        set ZO_ROOT_USER_PASSWORD=Complexpass#123
        zincobserve.exe


    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

=== "MacOS/Linux Binaries"
    Binaries can be downloaded from [releases](https://github.com/zinclabs/zincobserve/releases) page for appropriate platform.

        ZO_ROOT_USER_EMAIL=root@example.com ZO_ROOT_USER_PASSWORD=Complexpass#123 ./zincobserve


    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

=== "Docker"

    Docker images are available at [https://gallery.ecr.aws/zinclabs/zincobserve](https://gallery.ecr.aws/zinclabs/zincobserve)

        mkdir data
        docker run -v $PWD/data:/data -e ZO_DATA_DIR="/data" -p 5080:5080 \
            -e ZO_ROOT_USER_EMAIL=root@example.com -e ZO_ROOT_USER_PASSWORD=Complexpass#123 \
            public.ecr.aws/zinclabs/zincobserve:latest


    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

    **Error pulling image if you have AWS CLI installed?**

    If you have AWS CLI installed and get login error then run below command:

        aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

=== "Kubernetes - Manifest"

    Create a namespace:

        kubectl create ns zincobserve

    Create the deployment and port forward:

        kubectl apply -f https://raw.githubusercontent.com/zinclabs/zincobserve/main/deploy/k8s/statefulset.yaml

    Expose the zinc service by port-forwarding:

        kubectl -n zincobserve port-forward svc/zincobserve 5080:5080

    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

## Load sample data

We will use JSON API to load sample log data.

Below commands will download a sample file of real life log data, unzip it and load it in ZincObserve using the JSON ingestion API.

```shell
curl -L https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip -o k8slog_json.json.zip
unzip k8slog_json.json.zip
curl http://localhost:5080/api/default/quickstart1/_json -i -u root@example.com:Complexpass#123  --data-binary "@k8slog_json.json"
```

## Search for data

Point your browser to [http://localhost:5080](http://localhost:5080) and login

1. Select the index quickstart1 from drop down in the left
1. Search for match_all('error') in search bar and click the search button on right.

Click on the "syntax guide" button next to the search bar to see examples on how to search.

## Load 5.5 GB of data

We will try to ingest a lot more data in a loop.

```shell
for i in {1..100}; do; curl http://localhost:5080/api/default/quickstart1/_json -i -u root@example.com:Complexpass#123  --data-binary "@k8slog_json.json"; done
```

The above command will ingest 5.5 GB of data in ZincObserve. This could take a couple minutes depending on how fast your machine is. So be little patient.

Once the ingestion is complete, feel free to search through the data again and be amazed at the simplicity.
