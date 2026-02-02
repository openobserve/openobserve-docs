---
title: Vercel Application Logs Integration Guide
description: Forward Vercel application logs to OpenObserve using a serverless function for centralized storage, search, and monitoring.
---

# Integration with Vercel Application Logs

This guide explains how to forward Vercel application logs to OpenObserve using a custom serverless function within your Vercel project.

## Overview

Vercel Log Drains allow you to send application, build, and edge function logs to an external destination. By sending them to OpenObserve, you can search, visualize, and set alerts on logs in real time.  
This method uses a self-hosted serverless function as a relay to forward logs securely.

## Steps to Integrate

??? "Prerequisites"
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../getting-started/#self-hosted-installation))
    - Vercel project (Pro or Enterprise plan, Log Drains are not available on Hobby)
    - Vercel CLI or dashboard access
    - Basic Node.js knowledge for modifying serverless functions

??? "Step 1: Get OpenObserve Ingestion URL and Access Key"

    1. In OpenObserve: go to **Data Sources → Custom → Logs**
    2. Copy the ingestion URL and Access Key
    3. Update the URL to include your stream name, for example:
        ```
        https://<your-openobserve-domain>/api/<org_id>/<stream_name>/_json
        ```

    ![Get OpenObserve Ingestion URL and Access Key](../images/app-platforms/fetch-token.png)

??? "Step 2: Create a Vercel Serverless Function"

    1. In your Vercel project, create a file as `api/logs.js`
    2. Paste the following sample code:

        ```javascript
        import https from 'https';

        const OPENOBSERVE_URL = 'https://<your-openobserve-domain>/api/<org_id>/<stream_name>/_json';
        const API_KEY = '<your_base64_encoded_key>';
        const VERCEL_VERIFY_TOKEN = '<your_vercel_verification_token>';

        export default async function handler(req, res) {
          // Verify Vercel request
          if (req.headers['vercel-log-drain-signature'] !== VERCEL_VERIFY_TOKEN) {
            return res.status(401).send('Unauthorized');
          }

          const logs = Array.isArray(req.body) ? req.body : [req.body];
          const data = JSON.stringify(logs);

          const options = {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${API_KEY}`,
              'Content-Type': 'application/json'
            }
          };

          const request = https.request(OPENOBSERVE_URL, options, (response) => {
            response.on('data', () => {});
            response.on('end', () => res.status(200).send('OK'));
          });

          request.on('error', (error) => {
            console.error(error);
            res.status(500).send('Error forwarding logs');
          });

          request.write(data);
          request.end();
        }
        ```

    3. Replace placeholders:
        - `<your-openobserve-domain>` with your instance
        - `<org_id>` and `<stream_name>` from OpenObserve
        - `<your_base64_encoded_key>` from OpenObserve
        - `<your_vercel_verification_token>` from Vercel

??? "Step 3: Deploy the Function to Vercel"

    1. Push your code to trigger deployment
      ```
      git add api/logs.js
      git commit -m "Add log drain endpoint for OpenObserve"
      git push
      ```
    2. Note the deployed endpoint URL (e.g., `https://your-app.vercel.app/api/logs`)

??? "Step 4: Configure Log Drain in Vercel"

    1. Go to **Vercel Dashboard → Your Project → Settings → Log Drains**
    2. Add a new Log Drain:
        - **Endpoint URL**: Log endpoint URL from Step 3
        - **Sources**: Check “Function” and “Edge” for runtime logs; add “Build” for deployment logs if desired.
        - **Delivery Format**: Select “JSON”—Vercel’s default, and OpenObserve handles it natively.
    3. Save the configuration

    ![Configure Log Drain in Vercel](https://openobserve.ai/assets%2F4_setup_log_drain_bee0dcc96e.gif)

??? "Step 5: Verify Logs in OpenObserve"

    1. Generate some logs by hitting your application endpoints or triggering a deployment
    2. In OpenObserve, go to **Logs** → select your stream → click **Run Query**
    3. You should see recent log entries from your Vercel app

    ![Verify Logs in OpenObserve](https://openobserve.ai/assets%2F6_view_logs_o2_45ebd5489c.gif)

## Troubleshooting

??? "**No logs visible?**"
    - Check function logs in Vercel
    - Verify API key and ingestion URL in the function
    - Confirm Vercel Log Drain is enabled and pointing to the correct endpoint

??? "**401 Unauthorized**"
    - Ensure the verification token in Vercel matches the one in your function

??? "**Partial logs or missing fields**"
    - Inspect incoming payload format in your function logs
    - Ensure logs are sent as an array to OpenObserve (`[ {...}, {...} ]`)
