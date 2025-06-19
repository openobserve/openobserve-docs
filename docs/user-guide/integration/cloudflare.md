This guide provides step-by-step instructions to integrate Cloudflare with OpenObserve.

## Overview
The Cloudflare integration enables streaming of HTTP request logs, response codes, security events, and related dimensions from Cloudflare to OpenObserve.

Cloudflare offers two methods to send logs to OpenObserve. The method you choose depends on your Cloudflare plan and setup preferences:

- **GraphQL API**: Available on the following Cloudflare plans- Free, Pro, Business, and Enterprise. This method pulls logs from Cloudflare at regular intervals using an API script.
- **Logpush**: Available only on Cloudflare Enterprise plans. This method pushes logs from Cloudflare to OpenObserve in real time using an HTTP endpoint.

This integration can help you monitor performance, identify security issues, and troubleshoot problems by using real-time Cloudflare traffic logs in OpenObserve.

## Prerequisites
- **A Cloudflare account**: Sign up [here](https://dash.cloudflare.com/sign-up).
- **An OpenObserve account**: Sign up [here](https://openobserve.ai/downloads/).
- **A Cloudflare API token**: 

    - To use the **GraphQL method**, create a token with the **Read analyticsand logs** permission
    - To use the **Logpush method** (Enterprise only), create a token with the **Edit Logs** permission.

- **GraphQL-specific requirements**:

    - **Tools**: Python 3.8 or later, terminal access, and ability to use a virtual environment.
    - **Traffic Source**: A live website, a Cloudflare Worker, or an existing traffic.

## Steps to Integrate

### Step 1: Retrieve Your OpenObserve Endpoint and Credentials
To stream Cloudflare logs, log in to OpenObserve and follow these steps:

1. From the left menu, select **Data Sources > Custom > Logs > Curl**.
2. Extract the following details from the sample curl command: 

![Extract endpoint and credentials](../../images/extract-creds-from-data-sources.png)

- **Endpoint**: `https://api.openobserve.ai/api/<organization_name>/<stream_name>/_json`. 
Replace `organization_name` with the organization name shown at the top right corner of the screen. Replace the `stream_name` with **cloudflare_logs**.
- **Credentials**: 
The sample includes a string in the format: `your-username@example.com:802gZ3uo4N5S917s6Med`. 
Here, the username is `your-username@example.com` and the password is `FNIN8MWspXZRKRgS`. 

### Step 2: Generate Cloudflare Logs
To generate real logs for the GraphQL method, you need actual traffic routed through Cloudflare. Choose one of the following approaches:

**Option 1: Live website traffic using any Cloudflare plan**

1. Add a domain, such as example.com, in the Cloudflare dashboard.
2. Create a proxied DNS A record that points to your server. The proxy status must show the orange cloud icon.
3. Generate traffic by visiting the site, sharing the URL, or allowing users to access it.
4. Logs are produced when requests reach Cloudflare’s edge.

**Option 2: Cloudflare Worker on Free, Pro, Business, or Enterprise plans**

1. In the Cloudflare dashboard, go to **Workers and Pages**, then select **Create Worker**.
2. Assign a name, such as log-generator.
3. Use the following code:

```js linenums="1"
addEventListener("fetch", event => {
event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
const status = Math.random() > 0.8 ? 503 : 200; // 20% chance of 503
return new Response("Hello from Cloudflare!", {
    status: status,
    headers: { "Content-Type": "text/plain" }
});
}
```
4. Select **Deploy** and note the generated URL, such as `log-generator.example-subdomain.workers.dev`.
5. You may optionally add a route under **Workers Routes**, such as `example.com/log/*`.
6. Generate traffic by visiting the Worker URL, linking it on a webpage, or enabling access through a known route.
![Generate traffic visiting the Worker URL](../../images/cloudflare-worker-setup.gif)

![Cloudflare worker.js](../../images/cloudflare-worker-js.png)

**Option 3: Existing traffic on Business or Enterprise plans**

- Use a domain or Cloudflare Worker that is already proxied through Cloudflare.
- If the service already receives external traffic, no additional configuration is required. Logs will begin flowing automatically as requests are processed.

**Verify traffic in Cloudflare** <br>

1. From the Cloudflare dashboard, navigate to **Analytics** and select the **Traffic** tab.
2. Verify that incoming request data appears. This usually takes only a few minutes.

### Step 3: Stream Logs to OpenObserve
There are two options to send logs from Cloudflare to OpenObserve. Click each tab to learn more:

=== "Option 1: GraphQL API"
    **Generate API token**:

    1. In the Cloudflare dashboard, go to **My Profile > API Tokens > Create Token**.
    2. Select the **Read analytics** and logs template. Apply the token to all zones or selected zones.
    > **Note**: You can also create a custom token with the following scope: **Zone > Analytics > Read**. 
    3. Copy the API token. For example, `xUL39zImSqAG5-JJNpLMC7HVIqGuckorb9AKo-Tx`. 

    **Set up environment**
    
    1. Open a terminal and run the following commands to prepare the Python environment:

    ``` linenums="1"
    python3 -m venv venv
    source venv/bin/activate
    pip install requests
    ```
    2. Create a file named **cloudflare_logs_to_openobserve.py** and paste the following script:

    ```py linenums="1"
    import requests
    import time
    import json
    from datetime import datetime, timedelta, timezone
    import base64
    import random

    # Cloudflare config
    API_TOKEN = "xUL39zImSqAG5-JJNpLMC7HVIqGuckorb9AKo-Tx"
    EMAIL = "your-username@example.com"
    ZONE_IDS = []  # Specify zone IDs or leave empty for all zones

    # OpenObserve config
    OPENOBSERVE_URL = "https://api.openobserve.ai/api/your_organization_id/cloudflare_logs/_json"
    OPENOBSERVE_USER = "your-username@example.com"
    OPENOBSERVE_PASS = "your_password"

    def simulate_cloudflare_logs():
        methods = ["GET", "POST", "PUT"]
        uris = ["/", "/api/users", "/checkout"]
        statuses = [200, 404, 429, 503]
        countries = ["US", "IN", "UK"]
        return [{
            "dimensions": {
                "datetime": datetime.now(timezone.utc).isoformat(),
                "clientRequestHTTPMethodName": random.choice(methods),
                "clientRequestURI": random.choice(uris),
                "edgeResponseStatus": random.choice(statuses),
                "clientCountryName": random.choice(countries)
            },
            "sum": {
                "bytes": random.randint(100, 5000),
                "requests": random.randint(1, 5)
            }
        } for _ in range(random.randint(1, 5))]

    def fetch_cloudflare_logs(zone_ids):
        url = "https://api.cloudflare.com/client/v4/graphql"
        headers = {
            "X-Auth-Email": EMAIL,
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json"
        }
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(minutes=5)
        
        zone_filter = f'zoneTag: "{zone_ids[0]}"' if zone_ids else ""
        query = """
        {
        viewer {
            zones(%s) {
            httpRequests1mGroups(limit: 1000, filter: {datetime_geq: "%s", datetime_leq: "%s"}) {
                dimensions {
                datetime
                clientRequestHTTPMethodName
                clientRequestURI
                edgeResponseStatus
                clientCountryName
                }
                sum {
                bytes
                requests
                }
            }
            }
        }
        }
        """ % ("filter: {%s}" % zone_filter if zone_filter else "", 
            start_time.isoformat(), end_time.isoformat())

        response = requests.post(url, headers=headers, json={"query": query})
        if response.status_code != 200:
            print(f"API Error: {response.status_code} - {response.text}")
            return simulate_cloudflare_logs()
        try:
            data = response.json()
            if not data or not data.get("data", {}).get("viewer", {}).get("zones"):
                print("No logs yet. Using simulated data.")
                return simulate_cloudflare_logs()
            logs = []
            for zone in data["data"]["viewer"]["zones"]:
                logs.extend(zone["httpRequests1mGroups"])
            return logs
        except (json.JSONDecodeError, AttributeError):
            print("API response issue. Switching to simulation.")
            return simulate_cloudflare_logs()

    def send_to_openobserve(logs):
        if not logs:
            print("No logs to send.")
            return
        auth_str = base64.b64encode(f"{OPENOBSERVE_USER}:{OPENOBSERVE_PASS}".encode()).decode()
        headers = {"Authorization": f"Basic {auth_str}"}
        payload = [log["dimensions"] | log["sum"] for log in logs]
        response = requests.post(OPENOBSERVE_URL, headers=headers, json=payload)
        print(f"Sent {len(payload)} logs at {datetime.now(timezone.utc)}: {response.status_code}")

    if __name__ == "__main__":
        print("Streaming Cloudflare logs to OpenObserve...")
        while True:
            try:
                logs = fetch_cloudflare_logs(ZONE_IDS)
                send_to_openobserve(logs)
                time.sleep(60)
            except Exception as e:
                print(f"Error: {e}")
                logs = simulate_cloudflare_logs()
                send_to_openobserve(logs)
                time.sleep(60)
    ```
    3. In your terminal, run the above script:

    ```
    python cloudflare_logs_to_openobserve.py
    ```
    Logs transition from simulated to real as the traffic starts within 5 to 10 minutes.

    >(Optional) To run the script continuously in the background, use:

    >```
    >nohup python cloudflare_logs_to_openobserve.py &
    >```

=== "Option 2: Logpush" 
    **Generate an API Token**: 

    1. In the Cloudflare dashboard, go to **My Profile** and select **API Tokens**.
    2. Click **Create Token**.
    3. Use the **Edit Logs** template. You can also use a custom token by enabling the following permissions: 
    **Account > Logs > Edit**.
    4. Set the scope to your account or specific zones.
    5. Copy the generated API token.

    **Configure Logpush**:

    1. In the Cloudflare dashboard, go to **Analytics & Logs** > **Logpush**.
    2. Click **Create a Logpush Job**.
    3. Choose **HTTP Requests** dataset. 
    4. Select **HTTP destination**.
    5. In the destination URL field, enter:
    `https://api.openobserve.ai/api/your_organization_id/cloudflare_logs/_json`
    5. Add an Authorization header with the following values:
    
        - **Key**: Authorization
        - **Value**: Basic <base64-encoded-credentials>
    
    To encode your credentials, use the following command in a terminal:

    ``` linenums="1"
    echo -n "your-username@example.com:802gZ3uo4N5S917s6Med" | base64
    ```
    Save the job. Logpush will begin sending logs immediately.

## Verify Logs in OpenObserve
1. Log in to OpenObserve.
2. Go to **Logs**. 
3. From the stream selector dropdown, select **cloudflare_logs**.
4. Select the time range. 
5. Click **Run Query**. 
You should see entries similar to the following:

```json linenums="1"
{
  "_timestamp": 1742220353596180,
  "bytes": 2109,
  "clientcountryname": "IN",
  "clientrequesthttpmethodname": "POST",
  "clientrequesturi": "/",
  "datetime": "2025-03-17T14:05:53.447689+00:00",
  "edgeresponsestatus": 503,
  "requests": 1
}
```
![Verify the Cloudflare and OpenObserve integration](../../images/cloudflare-verify-ingestion.gif)

Logs appear immediately when using Logpush. If you are testing with GraphQL, the simulated data appears first. Real logs are usually visible within 5 to 10 minutes.

## Troubleshooting

**GraphQL Integration**:

- If the message No logs yet appears, check traffic under Analytics > Traffic.
- If an API Error occurs, examine the full response using response.text.

**Logpush Integration**: 

- Confirm the destination endpoint and authentication values in the Logpush job settings.

**No Logs in OpenObserve**:

- Verify that the organization ID and credentials are correct.
