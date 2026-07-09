---
title: Keycloak SSO
description: >-
  Configure Keycloak as an upstream identity provider for OpenObserve Enterprise SSO through Dex. Step-by-step setup covering Keycloak client, Dex connector, and OpenObserve environment variables.
---
<!-- search: Keycloak, SSO, Dex, OIDC, identity provider -->

!!! info "Availability"
    This feature is available in Enterprise Edition and Cloud. Not available in Open Source.

# Keycloak SSO with Dex

Configure Keycloak as the upstream identity provider for OpenObserve Enterprise, brokered through Dex.

## Overview

OpenObserve Enterprise uses **Dex** as its built-in OIDC broker for SSO. Dex does not store users itself. It delegates authentication to upstream connectors. In this setup, **Keycloak** is that upstream: users clicking **Login with SSO** on the OpenObserve login page are redirected through Dex to the Keycloak login page, then back into OpenObserve once authenticated.

```
User > OpenObserve UI > Dex > Keycloak (login page)
              ^           ^          |
              |_ session _|_ token _|
```

OpenObserve only talks to Dex, so the OpenObserve configuration stays the same regardless of the IdP behind it. Keycloak remains the source of truth for users, groups, and MFA policies. Additional connectors (e.g. Google) can coexist on the same Dex login screen.

### Environment used in this guide

This guide uses `cluster1.example.com` as the example domain. Replace hostnames, realm name, and secrets with your own values throughout.

| Component | URL |
|---|---|
| OpenObserve | `https://dev.cluster1.example.com` |
| Dex (issuer) | `https://dev-dex.cluster1.example.com/dex` |
| Keycloak | `https://keycloak.cluster1.example.com` |
| Keycloak realm | `o2` |

> **Note:** The Dex issuer includes the `/dex` path. This matters for both the Keycloak redirect URI and the OpenObserve `O2_DEX_BASE_URL`.

## Prerequisites

- **OpenObserve Enterprise** deployed (SSO/Dex is an Enterprise feature), `https://dev.cluster1.example.com`
- A **Dex** deployment reachable by both the user's browser and OpenObserve
- A **Keycloak** instance (v26.x in this setup) with admin access
  - Local dev: [docker-compose.yml](docker-compose.yml) (Keycloak 26.1 + Postgres 16)
  - Cluster: [k8s-deployment.yml](k8s-deployment.yml) + [httproute.yml](httproute.yml) (Envoy Gateway route on `keycloak.cluster1.example.com`)
- All three endpoints served over **HTTPS** with mutually trusted certificates
- Network connectivity: browser to all three; Dex to Keycloak; OpenObserve to Dex

## Part 1: Deploy Keycloak

Skip this part if Keycloak is already running.

**Local (Docker Compose):**

```bash
cd keycloak/
docker compose up -d          # uses .env for admin credentials and hostname
```

**Kubernetes (dev cluster):**

```bash
kubectl apply -f k8s-deployment.yml   # namespace, Postgres, Keycloak Deployment/Service
kubectl apply -f httproute.yml        # Envoy Gateway HTTPRoute for the internal hostname
```

Keycloak runs with `--proxy-headers=xforwarded` and `KC_HOSTNAME=keycloak.cluster1.example.com` so that issued tokens carry the public URL, not the in-cluster one. Verify readiness:

```bash
kubectl -n keycloak get pods
kubectl -n keycloak logs deploy/keycloak | grep "Listening"
```

## Part 2: Configure Keycloak

### Step 2.1: Log in to the Keycloak Admin Console

1. Open `https://keycloak.cluster1.example.com` in your browser.
2. Click **Administration Console** and log in with the admin credentials (from the `keycloak-secret` or `.env`).
3. In the top-left realm selector, choose the `o2` realm.
   If it does not exist, click **Create realm**, name it `o2`, and save.

### Step 2.2: Create a client for Dex

1. In the left menu, go to **Clients** → click **Create client**.
2. On the *General settings* page:
   - **Client type:** `OpenID Connect`
   - **Client ID:** `dex`
   - Click **Next**.
3. On the *Capability config* page:
   - Enable **Client authentication** (confidential client).
   - Ensure **Standard flow** is checked (Authorization Code flow).
   - Click **Next**.
4. On the *Login settings* page:
   - **Valid redirect URIs:** `https://dev-dex.cluster1.example.com/dex/callback`
     (note the `/dex` path segment; Dex's callback lives under its issuer path)
   - **Web origins:** `https://dev-dex.cluster1.example.com` (optional)
   - Click **Save**.

### Step 2.3: Copy the client secret

1. Open the newly created `dex` client.
2. Go to the **Credentials** tab.
3. Copy the **Client Secret**. Paste it into the Dex connector config in Part 3.

### Step 2.4: Expose group membership in tokens (optional, for OpenObserve RBAC)

Skip this step if all SSO users land in the default org with the default role (`O2_DEX_DEFAULT_ORG` / `O2_DEX_DEFAULT_ROLE`).

1. Go to **Client scopes** → **Create client scope**.
   - **Name:** `groups`
   - **Type:** `Default`
   - **Protocol:** `OpenID Connect`
   - Save.
2. Open the new `groups` scope → **Mappers** tab → **Configure a new mapper** → choose **Group Membership**.
   - **Name:** `groups`
   - **Token Claim Name:** `groups`
   - **Full group path:** `OFF`
   - **Add to ID token:** `ON`
   - **Add to userinfo:** `ON`
   - Save.
3. Go back to **Clients** → `dex` → **Client scopes** tab → **Add client scope** → select `groups` → add as **Default**.

The Dex connector already has `insecureEnableGroups: true` and `getUserInfo: true` (Part 3), so the `groups` claim flows through Dex into the token OpenObserve receives.

### Step 2.5: Create a test user

1. Go to **Users** → **Add user**.
2. Set a **Username** and **Email** (the email becomes the OpenObserve user identity), then save.
3. Open the **Credentials** tab → **Set password** → disable *Temporary* → save.

### Step 2.6: Verify the realm's OIDC discovery endpoint

```bash
curl https://keycloak.cluster1.example.com/realms/o2/.well-known/openid-configuration
```

Confirm the JSON loads and note the `issuer` value. The Dex connector must use it exactly as shown:

`https://keycloak.cluster1.example.com/realms/o2`

## Part 3: Configure Dex

### Step 3.1: Add the Keycloak connector

The dev configuration lives in [dev-dex-config.yaml](dev-dex-config.yaml). The relevant pieces:

```yaml
issuer: https://dev-dex.cluster1.example.com/dex

storage:
  type: kubernetes
  config:
    inCluster: true

web:
  http: 0.0.0.0:5556

frontend:
  issuer: OpenObserve
  logoURL: https://cloud.openobserve.ai/web/src/assets/images/common/open_observe_logo.svg

oauth2:
  responseTypes: [code]
  skipApprovalScreen: true

expiry:
  idTokens: 18000m
  refreshTokens:
    validIfNotUsedFor: 30m

connectors:
  - type: oidc
    id: keycloak
    name: O2Keycloak            # label shown on the Dex login screen
    config:
      # Must exactly match the issuer from Step 2.6
      issuer: https://keycloak.cluster1.example.com/realms/o2
      clientID: dex
      clientSecret: <KEYCLOAK_CLIENT_SECRET_FROM_STEP_2.3>
      redirectURI: https://dev-dex.cluster1.example.com/dex/callback
      scopes:
        - profile
        - email
      insecureEnableGroups: true      # forward the groups claim from Keycloak
      getUserInfo: true               # fetch extra claims from the userinfo endpoint
      userNameKey: preferred_username # use the Keycloak username as identity

# OpenObserve is the (only) downstream client of Dex
staticClients:
  - id: o2-client
    name: o2-client
    secret: <O2_CLIENT_SECRET>
    redirectURIs:
      - https://dev.cluster1.example.com/config/redirect
```

Two values here are OpenObserve conventions:

- **`staticClients.id: o2-client`** must match `O2_DEX_CLIENT_ID` in the OpenObserve config (Part 4).
- **Redirect URI `/config/redirect`** is OpenObserve's fixed OIDC callback path. Only the host changes per environment.

> **Tip:** Generate the static client secret with `openssl rand -hex 32`. Store secrets in Kubernetes Secrets rather than version control. The checked-in dev config is for the internal dev cluster only.

### Step 3.2: Deploy or restart Dex

In the OpenObserve Enterprise Helm deployment, this config goes under the Dex section of the chart values. After updating:

```bash
helm upgrade -n openobserve o2 openobserve/openobserve -f values.yaml
# or, if Dex is deployed standalone:
kubectl -n dex rollout restart deploy/dex
```

### Step 3.3: Verify Dex is up

```bash
curl https://dev-dex.cluster1.example.com/dex/.well-known/openid-configuration
```

You should get JSON with `"issuer": "https://dev-dex.cluster1.example.com/dex"`. Check logs:

```bash
kubectl logs -n dex deploy/dex | grep -i connector
```

A healthy startup lists the `keycloak` connector with no `failed to initialize connector` errors.

## Part 4: Configure OpenObserve

Set the Dex-related environment variables on the OpenObserve deployment (in Helm: the enterprise/auth values; standalone: container env):

```bash
O2_DEX_ENABLED=true
O2_DEX_CLIENT_ID=o2-client
O2_DEX_CLIENT_SECRET=<O2_CLIENT_SECRET>            # matches staticClients secret in Dex
O2_DEX_BASE_URL=https://dev-dex.cluster1.example.com/dex
O2_CALLBACK_URL=https://dev.cluster1.example.com/web/cb
O2_DEX_REDIRECT_URL=https://dev.cluster1.example.com/config/redirect

# Where SSO users land if no group mapping applies
O2_DEX_DEFAULT_ORG=default
O2_DEX_DEFAULT_ROLE=user
```

If you enabled the groups mapper (Step 2.4) and want Keycloak groups to drive OpenObserve org/role assignment, configure the group-claim variables (`O2_DEX_GROUP_CLAIM`, `O2_DEX_GROUP_ATTRIBUTE`, `O2_DEX_ROLE_ATTRIBUTE`) per the [OpenObserve SSO docs](https://openobserve.ai/docs/sso/). The parsing convention differs between LDAP-style DNs and flat group names, so match it to how the groups appear in the token.

Restart OpenObserve after changing env vars:

```bash
kubectl -n openobserve rollout restart statefulset/o2-openobserve-router   # or the relevant workload
```

## Part 5: Test the Integration

1. Open `https://dev.cluster1.example.com` and click **Login with SSO**.
2. The Dex login screen appears (OpenObserve-branded). Choose **O2Keycloak**.
   With `skipApprovalScreen: true` and a single connector, Dex redirects straight through.
3. You are redirected to the **Keycloak login page** for the `o2` realm.
4. Log in with the test user from Step 2.5.
5. You land back in OpenObserve, authenticated, as a member of `O2_DEX_DEFAULT_ORG` with `O2_DEX_DEFAULT_ROLE` (or the mapped role).
6. Verify identity: in OpenObserve, check the user menu or **IAM** → **Users** for the new user. Confirm the email matches Keycloak. To inspect claims, decode the ID token and confirm `email`, `preferred_username`, and (if configured) `groups` are present.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `failed to initialize connector: issuer did not match` in Dex logs | Keycloak's issuer differs from Dex config | Copy the `issuer` verbatim from the discovery URL (Step 2.6). Check `KC_HOSTNAME` and proxy settings. With Envoy Gateway, Keycloak needs `--proxy-headers=xforwarded`. |
| "Invalid redirect_uri" on the Keycloak page | Redirect URI mismatch | Ensure `https://dev-dex.cluster1.example.com/dex/callback` (with `/dex`) is listed exactly in the Keycloak `dex` client. |
| OpenObserve shows an OAuth error after Keycloak login | `o2-client` mismatch between Dex and OpenObserve | `O2_DEX_CLIENT_ID` and `O2_DEX_CLIENT_SECRET` must match the Dex `staticClients` entry. `O2_DEX_REDIRECT_URL` must match the registered redirect URI. |
| **Login with SSO** button missing in OpenObserve | Dex not enabled or not Enterprise | Set `O2_DEX_ENABLED=true` and confirm the Enterprise image/license is in use. Restart the router. |
| `x509: certificate signed by unknown authority` in Dex logs | Dex does not trust Keycloak's TLS cert | Mount the CA into Dex and set `rootCAs: [/etc/dex/ca.pem]` in the connector config. |
| User lands in the wrong org/role | Group mapping not applied | Re-check Step 2.4, `insecureEnableGroups: true`, and the `O2_DEX_GROUP_*` variables. Decode the token to confirm the `groups` claim shape. |
| Login loops or immediately fails | Wrong Keycloak client secret in Dex | Re-copy the secret from Keycloak's Credentials tab into the connector config and restart Dex. |
| Keycloak issues tokens with the in-cluster URL | Frontend hostname not set | Set `KC_HOSTNAME=keycloak.cluster1.example.com` (already in [k8s-deployment.yml](k8s-deployment.yml)). |

## Security Checklist

- [ ] HTTPS enforced on OpenObserve, Dex, and Keycloak
- [ ] Dex connector and `o2-client` secrets stored in Kubernetes Secrets, not committed to git
- [ ] `o2-client` secret randomly generated (32+ bytes), not the default `example-app-secret`
- [ ] Keycloak `dex` client restricted to the exact `/dex/callback` redirect URI (no wildcards)
- [ ] Token lifetimes reviewed: Keycloak (Realm Settings > Tokens) and Dex `expiry` (`idTokens: 18000m` is dev-friendly; tighten for production)
- [ ] MFA/OTP enabled in the Keycloak `o2` realm for production (Authentication > Required actions)
- [ ] Default Keycloak admin credentials (`admin/admin` in the dev manifests) rotated
- [ ] Unused Dex connectors and static clients removed

## Reference URLs

| Component | Endpoint |
|---|---|
| OpenObserve | `https://dev.cluster1.example.com` |
| OpenObserve OIDC callback (register in Dex) | `https://dev.cluster1.example.com/config/redirect` |
| Dex discovery | `https://dev-dex.cluster1.example.com/dex/.well-known/openid-configuration` |
| Dex callback (register in Keycloak) | `https://dev-dex.cluster1.example.com/dex/callback` |
| Keycloak discovery | `https://keycloak.cluster1.example.com/realms/o2/.well-known/openid-configuration` |
| OpenObserve SSO docs | `https://openobserve.ai/docs/sso/` |
| Dex OIDC connector docs | `https://dexidp.io/docs/connectors/oidc/` |
| Keycloak docs | `https://www.keycloak.org/documentation` |

**Need help:**

  [Community Slack](https://short.openobserve.ai/community)
  
  [GitHub issues](https://github.com/openobserve/openobserve/issues)
