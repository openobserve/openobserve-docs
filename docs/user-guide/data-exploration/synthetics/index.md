---
title: Synthetics
description: Run scripted browser and protocol checks on a schedule from global locations, and catch outages before your users report them.
---

# Synthetics

Synthetics runs scripted checks against your applications and infrastructure on a schedule, from locations around the world, so you find outages and slowdowns before your users report them.

![Synthetics checks list showing the folder sidebar, health summary, type filters, and the checks table](images/overview-populated.png)

## Overview

Real user monitoring tells you what happened to the people who visited your site. Synthetic monitoring tells you what would happen if someone visited right now. OpenObserve Synthetics runs checks continuously from probe locations you choose, records every run, and keeps the evidence needed to explain a failure after the fact.

Synthetics serves two audiences. Site reliability and operations teams use protocol checks to confirm that endpoints answer, ports accept connections, and certificates have not expired. Product and QA teams use browser tests to confirm that a real user journey — sign in, search, add to cart, check out — still works end to end in a real browser.

Every check produces a run history you can slice by location, browser, and device, with pass rate, latency percentiles, retry and flakiness rates, and per-step timing. When a run fails, the run detail page names the step that broke, shows the screenshot taken at that moment, and reports which locator matched and what the page was doing at the time.

> **Note**: Synthetics is an enterprise feature and is currently in **Beta**. If you do not see it in the sidebar, ask your administrator to enable `O2_SYNTHETICS_ENABLED`.

## Key features

### Browser tests that verify outcomes, not only clicks

A browser test replays a multi-step journey in a real browser from your chosen locations. Steps are recorded with a Chrome extension or built by hand.

- Nine step actions: **Navigate**, **Click**, **Type**, **Select**, **Press**, **Check**, **Uncheck**, **Upload**, and **Assert**
- Six assertion kinds, so a journey states an outcome rather than only performing actions
- Per-step screenshots and a full step timeline on every run
- Runs across a matrix of browsers and devices, each combination as its own execution

![Step editor showing the action dropdown open with all nine available actions](images/detail-step-actions.png)

### Resilient element locators

Each step carries an ordered list of ways to find its element, tried top to bottom. The first one that matches is used, so a cosmetic markup change does not break an otherwise healthy check.

- Locator kinds: **Test attribute**, **Role**, **Text**, **CSS**, and **XPath**
- Reorder by dragging, add your own, or delete ones you do not want
- Combine several locators into one stricter locator
- Run detail reports which candidate matched, so you can see when a fallback saved a step

### Protocol checks

Protocol checks verify connectivity and correctness without a browser.

- **HTTP / API**: method, headers, request body, redirects, and assertions on status code, response body, or response time
- **TCP Port**: confirm a host and port accept connections, optionally matching the first response bytes
- **SSL / TLS Certificate**: validity, chain and hostname verification, and expiry warnings
- **SSH**: confirm SSH connectivity using a password or private key

![HTTP Request card with method, timeout, follow redirects, headers, and a status code assertion](images/config-http-request.png)

### Failure evidence

When a run fails, OpenObserve keeps what it needs to explain the failure.

- The step that failed, with its error message and stack trace
- The screenshot captured at the moment of failure
- Console errors, page errors, failed requests, and non-2xx responses, attributed to the step that produced them
- Each retry attempt kept separately, so you can compare the attempt that failed with the one that decided the run

### Public and private probe locations

Checks run from OpenObserve-operated public locations, from your own network, or both.

- Twelve public AWS regions across North America, Europe, and Asia Pacific
- Private locations run on your infrastructure, so checks can reach internal systems
- Private locations register themselves when their agent first connects

![Locations card listing twelve public AWS regions and the private locations section](images/config-locations.png)

## Getting started

### Prerequisites

- An enterprise or cloud OpenObserve organization with Synthetics enabled
- Permission to create checks in at least one folder
- For browser test recording: Google Chrome with the OpenObserve Recorder extension
- For private locations: a host in your network that can run Docker, Kubernetes, or a native binary

### Accessing Synthetics

1. Open **Experience** in the left sidebar.
2. Select **Synthetics**.

The page opens on the **Checks** tab. Use the **Private Locations** tab to manage your own probe locations.

Before you create anything, the Checks tab offers a shortcut into each check type.

![Empty Synthetics checks list with Create your first Check and one card per check type](images/overview.png)

## How to create a browser test

Follow these steps to record and configure a browser journey.

### Step 1: Choose the check type

Click **New Check**, then select **Browser Test**. The dialog confirms which folder the check is created in.

![Create a Check dialog showing Browser Test, HTTP / API, TCP Port, SSL / TLS Certificate, and SSH options](images/step-01-check-type-picker.png)

### Step 2: Set the starting URL

Enter the **Starting URL** where the journey begins. Optionally set a **Name** — OpenObserve fills this from the page if you leave it blank. The URL accepts variables such as `{{baseUrl}}`.

![Browser check gate with Starting URL and Name fields, and Record journey and Build manually buttons](images/step-02-browser-gate.png)

### Step 3: Connect the recorder

Click **Record journey**. If the OpenObserve Recorder extension is not connected yet, a setup screen walks you through installing it, allowing it in Incognito, and clicking its toolbar icon to activate it for the tab.

Click **Skip -- I'll build the steps manually** to write steps by hand instead.

![Recorder setup screen with three numbered steps and an Open and Record button](images/step-03-recorder-setup.png)

### Step 4: Record or build the journey

Recording opens your starting URL in a fresh incognito window and captures your clicks and inputs as steps. To build by hand, click **Add a step manually** and choose an action.

A new journey starts empty, with both options offered directly.

![Journey step with no steps yet, offering Record journey and Add a step manually](images/step-04-journey-empty.png)

Every journey must begin with a **Navigate** step.

![Journey step editor showing action, step name, locator field, and a notice that the journey verifies nothing](images/step-05-step-editor.png)

### Step 5: Add an assertion

A journey that only clicks can click its way through a broken page and still pass. OpenObserve warns you when a journey has no assertions.

Add an **Assert** step and choose what to verify:

| Assertion | Verifies | Needs a locator |
|-----------|----------|-----------------|
| **Element is visible** | The element is present on the page | Yes |
| **Element is not visible** | The element is absent | Yes |
| **Element contains text** | The element's text matches the expected value | Yes |
| **URL matches** | The page URL matches a pattern | No |
| **Page title is** | The page title matches the expected value | No |
| **Attribute equals** | A named attribute matches the expected value | Yes |

![Assert step configured with the Page title is assertion and an expected value](images/detail-assertion-step.png)

### Step 6: Tune step behavior

Expand **Advanced** on any step to control timing and failure handling.

- **Timeout**: how long the step may spend acting. Blank uses the 30 second default; the maximum is 60 seconds.
- **Wait for the page to settle**: how long the step may spend waiting for the page to finish after the action. Blank uses the 30 second default.
- **Optional**: if this step fails, skip it and keep going. Use it for cookie banners and one-time popups.
- **Always run**: run this step during cleanup even after an earlier step failed. Use it for teardown, such as signing out.

![Advanced group expanded showing step timeout and page settle budget fields](images/detail-step-advanced.png)

### Step 7: Continue to configuration

Click **Continue**. If the journey is not valid, OpenObserve blocks the move and highlights the step that needs fixing.

![Journey showing the First step must be Navigate validation error](images/detail-journey-validation.png)

### Step 8: Configure and save

Complete the configuration cards described in [Configuration](#configuration), then click **Save & Exit**.

![Configure step showing the Check Details and Authentication and Network cards](images/step-06-configure.png)

## How to create a protocol check

Protocol checks skip the journey step entirely and open straight into a single configuration page.

### Step 1: Choose the type

Click **New Check** and select **HTTP / API**, **TCP Port**, **SSL / TLS Certificate**, or **SSH**.

### Step 2: Set the target

Enter a **Name** and the target. HTTP checks take a full **URL**; TCP, TLS, and SSH checks take a bare **Host** such as `example.com` or `example.com:8443`.

![New HTTP / API Check page with Check Details and HTTP Request cards](images/step-07-http-check.png)

### Step 3: Configure the request

Fill in the per-type request card. For HTTP, add assertions to state what a healthy response looks like — by default OpenObserve asserts `status_code equals 200`.

![TLS Certificate card with port, timeout, expiry threshold, and verification toggles](images/config-tls-request.png)

TCP checks need only a port and timeout, plus an optional substring to match in the first response bytes.

![TCP Connection card with port, timeout, and response contains fields](images/config-tcp-request.png)

SSH checks authenticate with either a password or a private key.

![SSH card with port, username, authentication type, and timeout](images/config-ssh-request.png)

### Step 4: Complete the shared configuration and save

Set the schedule, retries, alerts, and locations, then click **Save & Exit**.

## How to review results

### Open the results page

Click any row in the checks table. The results page opens on the **Overview** tab, scoped to the last 15 minutes by default.

Use **Run now** to trigger a manual execution, **Edit Check** to change the configuration, and the time range picker to widen the window.

![Monitor Results Overview with status timeline, KPI tiles, response time and error charts, pass rate panels, and the runs table](images/step-11-monitor-results-overview.png)

The Overview tab reports:

- **Status Timeline**: every run in the window as a pass, warning, or fail band
- **KPI tiles**: Last Run, Pass Rate, P95 Duration, Retry Rate, Flaky Rate, and Failed Runs
- **Response Time** and **Errors Over Time** charts
- **Pass Rate by Browser**, **by Location**, and **by Device**
- The runs table, filterable by status, browser, device, and location

Protocol checks show a slightly different Overview. They have no **Steps** tab, they report **Warning Runs** in place of **Flaky Rate**, and they show **Duration by Location** instead of the browser and device panels.

![HTTP check results Overview with a single Overview tab, Warning Runs tile, and Duration by Location panel](images/step-17-http-results-overview.png)

### Find the step that is failing

Open the **Steps** tab on a browser check to compare steps across every run in the window. It ranks steps by fail rate, flaky rate, and duration, which is how you find both the step that breaks most often and the step that is slowing the journey down.

![Steps tab showing per-step fail rate, flaky rate, and average, p95, and max duration](images/step-12-monitor-results-steps.png)

### Inspect a single run

Click a run to open the run detail drawer. The **Steps** tab shows the journey as a timeline with a screenshot, action, and duration per step.

![Run detail drawer for a passing run showing the two-step timeline with durations](images/step-13-run-detail.png)

Expand any step for its full detail.

![Run detail drawer with an expanded step showing the captured screenshot, action, selector, URL, and duration](images/detail-run-step-expanded.png)

### Diagnose a failure

On a failed run, the header names the failing step and the attempt that decided the run. The failed step carries its error message and the screenshot taken at that moment.

![Failed run detail showing Failed at Step 2, the attempt selector, the assertion error message, and the failure screenshot](images/step-16-run-detail-failed.png)

Open the **Evidence** tab for what the application was doing: console errors, page errors, failed requests, and non-2xx responses, each attributed to the step whose window it fell in.

![Evidence tab listing captured network and console events with time, type, status, method, and step](images/step-14-run-evidence.png)

> **Note**: Evidence is retained for failed runs only. On a passing run the Evidence tab explains this rather than showing an empty table.

### Read a protocol run

Protocol runs report a timing breakdown instead of a step timeline, so you can see whether latency came from DNS, connection setup, the TLS handshake, or the server itself.

![Protocol run detail with result, DNS Connect TLS TTFB timing breakdown, assertions, TLS certificate expiry, and probe metadata](images/step-18-protocol-run-detail.png)

## How to set up a private location

Private locations run checks from inside your own network, so they can reach systems that are not exposed to the internet.

### Step 1: Open the setup drawer

Go to the **Private Locations** tab and click **Set up an agent**.

![Private Locations tab showing the empty state and the Set up an agent action](images/step-08-private-locations.png)

### Step 2: Name the location and choose the agent type

Enter a **Location name**. Reuse the same name on every agent that should serve that location — a location is a pool of interchangeable agents, not one location per machine. Optionally name the individual agent.

Choose what the agent runs:

- **Net**: HTTP, TCP, TLS, and SSH checks. Runs on Docker, Kubernetes, Linux, or Windows.
- **Browser**: browser journeys. Runs the Playwright image, so Docker or Kubernetes only.

![Set up a private agent drawer with location name, agent type tabs, platform tabs, and the generated install command](images/step-09-agent-setup-drawer.png)

Switching to **Browser** changes both the command and the available platforms, since browser agents run a container image.

![Agent setup drawer on the Browser tab, offering only Docker and Kubernetes platforms](images/detail-agent-browser-tab.png)

### Step 3: Run the install command

Pick your platform tab, copy the command, and run it on a host in your network.

> **Warning**: The generated command embeds a live agent token. Treat it as a credential — do not paste it into shared documents, tickets, or chat.

### Step 4: Assign the location to checks

The location registers itself the first time an agent connects and turns **Online**. There is nothing to create in the UI. Select it in the **Locations** card when creating or editing a check.

### Manage agent tokens

Agents authenticate with org-level `o2syn_` tokens, managed under **IAM > Synthetics Tokens**. Create a named token per region or site to limit the blast radius if one is compromised, rotate the default token, or disable a token you no longer trust.

![Synthetics Tokens page under IAM showing the default token with its status, agent count, and actions](images/step-10-synthetics-tokens.png)

## How to manage checks

From the checks table you can:

- **Filter by folder** using the left sidebar, or search across all folders
- **Filter by type** using the All / Browser / HTTP / TCP / TLS / SSH toggle
- **Filter by status** by clicking a tile in the health summary
- **Edit**, **Trigger**, **Pause**, **Duplicate**, **Move**, or **Delete** a single check from its row
- Select multiple checks to pause, enable, trigger, move, or delete them together

> **Tip**: A paused check cannot be triggered. Enable it first.

Choosing **Edit** on a browser check reopens the journey with its steps collapsed, so you can find the one you want to change without scrolling through expanded editors.

![Edit view of a browser check showing collapsed Navigate and Assert steps](images/step-15-edit-journey.png)

## Configuration

### Check details

| Setting | Description | Default |
|---------|-------------|---------|
| **Name** | Identifies the check throughout the UI. Required. | — |
| **Folder** | The folder the check lives in. Also governs access. | `default` |
| **Enabled** | Whether the check runs on its schedule | On |
| **Starting URL** / **URL** / **Host** | What the check targets. Browser and HTTP take a URL; TCP, TLS, and SSH take a bare host. Required. | — |
| **Description** | Free text for your own reference | Empty |
| **Tags** | Labels for grouping and filtering | None |

![Check Details card with name, folder, enabled toggle, starting URL, description, and tags](images/config-check-details.png)

### Schedule

| Setting | Description | Default | Options |
|---------|-------------|---------|---------|
| **Frequency** | How often the check runs | 5 min | 1 min, 5 min, 15 min, 30 min, 1 hour, Custom, Cron |
| **Custom interval** | Used when Frequency is Custom | — | Minutes, Hours, Days, Weeks, Months |
| **Cron expression** | Used when Frequency is Cron, with a timezone | — | Any valid cron expression |
| **Start** | When the check becomes active | Schedule now | Schedule now, Schedule later |

![Schedule card with frequency presets and start type toggle](images/config-schedule.png)

### Retries

| Setting | Description | Default | Limit |
|---------|-------------|---------|-------|
| **Retries on failure** | Extra attempts before the run is called failed | 0 | 2 for browser checks, 3 for protocol checks |
| **Wait between retries** | Delay before the next attempt | 5 s | — |

Retries run inside the same job, so the whole sequence has to fit the check's run budget. If a configuration could exceed it, OpenObserve blocks the save and tells you which combination is too large.

![Retries card with retry count and wait between retries, plus the maximum retries hint](images/config-retries.png)

### Alerts

| Setting | Description | Default |
|---------|-------------|---------|
| **Alerted if test fails** | Consecutive failures before notifying | 1 |
| **Cooldown period** | Minimum gap between notifications | 5 minutes |
| **Destinations** | Notification destinations to alert | None |

Destinations are the same ones used elsewhere in OpenObserve alerting.

![Alerts card with failure threshold, cooldown period, and destinations selector](images/config-alerts.png)

### Locations

Select one or more locations. At least one is required.

Public locations cover twelve AWS regions: Mumbai, Singapore, Sydney, Montreal, Frankfurt, London, Paris, Stockholm, N. Virginia, Ohio, N. California, and Oregon.

Private locations appear once their agents register. OpenObserve only offers a private location for checks its live agents can run, so a browser test does not list a location served only by network agents.

### Browsers and devices

Browser checks run against a matrix of browser and device combinations. Each selected combination runs as a separate execution, and at least one must be selected.

| Device | Viewport |
|--------|----------|
| **Desktop** | 1440 x 900 |
| **Tablet** | 768 x 1024 |
| **Mobile** | 375 x 667 |

![Browsers and Devices matrix](images/config-browsers-devices.png)

> **Tip**: Every combination multiplies the work in a run. Add combinations deliberately — a matrix that is too wide can push the check past its run budget.

### Capture

| Setting | Description | Default | Options |
|---------|-------------|---------|---------|
| **Screenshot** | When to capture step screenshots | On fail | Always, On fail, Off |

![Capture card with the screenshot policy selector](images/config-capture.png)

### Authentication and network

Available on browser and HTTP checks.

| Setting | Description |
|---------|-------------|
| **HTTP Basic auth** | Username and password sent with requests |
| **Variables** | Reusable values referenced as `{{name}}`, optionally masked as sensitive |
| **Custom headers** | Headers added to every request |
| **Pre-set cookies** | Cookies set before the journey starts |

![Authentication and Network card with basic auth toggle and variables](images/config-auth-network.png)

## Best practices

- **Assert something on every journey.** A journey with no assertions only proves the steps could be performed, not that your application worked.
- **Prefer test attributes over CSS and text locators.** Attributes such as `data-test` survive redesigns; text and generated class names do not.
- **Keep more than one locator per step.** A step with a single locator and no fallback has nothing to try when the markup changes.
- **Mark genuinely optional steps as Optional.** Cookie banners and one-time popups appear inconsistently and will otherwise fail runs at random.
- **Set step timeouts to match your application, not to make runs fast.** A timeout shorter than the real response time is the most common cause of false failures.
- **Set Screenshot to Always while building a check**, then move it to On fail once it is stable, to keep storage in check.
- **Name steps for their purpose.** Run results show step names, so "Sign in with valid credentials" is far more useful than "Click".
- **Use folders and tags to scope access and reporting** as the number of checks grows.
- **Use a separate token per region** for private agents, so revoking one does not take down every location.

## Troubleshooting

### The Synthetics entry is missing from the sidebar

**Problem**: You cannot find Synthetics under **Experience**.

**Solution**:

1. Confirm your organization is on an enterprise or cloud plan.
2. Ask your administrator to enable `O2_SYNTHETICS_ENABLED`.
3. Reload the page. Navigating directly to the URL while the feature is off redirects you home.

### The recorder will not connect

**Problem**: You clicked **Record journey** but the setup screen never reports the recorder as connected.

**Solution**:

1. Confirm the OpenObserve Recorder extension is installed in Chrome.
2. Open `chrome://extensions`, click **Details** on the extension, and enable **Allow in Incognito**. Replays run in a clean incognito session and cannot start without this.
3. Click the extension icon in your toolbar to inject the recorder into the current tab. Chrome cannot connect automatically to pages that were open before the extension was installed.
4. If a previous replay is still running, wait for it to finish or reload the extension.

### Saving is blocked with "First step must be Navigate"

**Problem**: **Continue** or **Save** does nothing and a step is highlighted.

**Solution**: Every journey has to open a page before it can act on one. Change the first step's action to **Navigate**, or add a Navigate step above it. The same validation covers steps missing a name, a locator, or an expected value.

### A check reports failures the application never had

**Problem**: Runs fail intermittently but the application is healthy when you check by hand.

**Solution**:

1. Open the **Steps** tab to find which step fails most often.
2. Open a failed run and check the error. A timeout on an element that exists usually means the step timeout is shorter than the real response time.
3. Check the locator resolution on the failed step. If a fallback locator matched, the markup has changed and the primary locator needs updating.
4. If the step depends on something that is not always present, mark it **Optional**.

### The Evidence tab is empty

**Problem**: You opened Evidence on a run and there is nothing there.

**Solution**: Evidence is retained for failed runs only. On a passing run this is expected. If a failed run's evidence will not load, the bundle may have passed its retention window, or the download link may have expired — reload the run to get a fresh one.

### A private location will not accept checks

**Problem**: Your private location does not appear when selecting locations, or shows an offline warning.

**Solution**:

1. Confirm at least one agent is running and reachable. A location with no live agent will not run checks.
2. Confirm the agent type matches the check. Browser tests need an agent running the browser image; network agents cannot run them.
3. Confirm the agent's token is still enabled under **IAM > Synthetics Tokens**.
4. Check that every agent for the location was deployed with the same location name.

### A location cannot be deleted

**Problem**: The delete action on a private location is disabled.

**Solution**: Checks are still assigned to it. Reassign or delete those checks first, then delete the location.
