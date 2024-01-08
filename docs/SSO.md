> `Applicable to enterprise version`

# SSO using Dex & Ldap with OpenObserve 

OpenObserve, in its enterprise version, integrates Single Sign-On (SSO) capabilities using Dex, an OpenID Connect Identity (OIDC) and OAuth 2.0 provider. This feature is exclusive to the enterprise version of OpenObserve.

## Setup dex with ldap
This guide outlines configuring Dex with LDAP as an authentication backend within a Kubernetes cluster.

### Prerequisites
- A Kubernetes cluster.
- An LDAP server, like OpenLDAP, accessible from within the cluster.
- Familiarity with Kubernetes and LDAP.


### Dex Configuration
1. Issuer URL
    - issuer: issuer url of Dex ,this is used by clients to discover OIDC endpoints.
    - Example: https://{dex-host}/dex
1. Storage Backend
    - Dex supports various storage backends. In this configuration, Kubernetes custom resources are used.
    - type: kubernetes
    - config: inCluster: true - Dex runs inside the Kubernetes cluster and accesses the API server directly.

3. Web Server Configuration
    - http: Dex's HTTP server endpoint. In this case, it listens on all interfaces (0.0.0.0) and port 5556.

4. Token Expiry
    - idTokens: Expiration time for ID tokens (10 minutes).
    - refreshTokens: Settings for refresh token expiration.
    - validIfNotUsedFor: Refresh tokens are valid if they haven't been used for 30 minutes.

### LDAP Connector Configuration

1. LDAP Server Connection
    - type: ldap
    - host: Address of the LDAP server (openldap:389).
    - insecureNoSSL: Set to true for plain LDAP without TLS.


2. Bind Credentials
    - bindDN: Distinguished Name (DN) of the LDAP user for binding.
    - bindPW: Password for the bind DN.

3. User Search Configuration
    - baseDN: Base DN for user searches.
    - filter: LDAP filter for user searches.
    - username: Attribute used for the username.
    - idAttr: Attribute representing the user's ID.
    - emailAttr: Attribute for the user's email.
    - nameAttr: Attribute for the user's name.

4. Group Search Configuration
    - baseDN: Base DN for group searches.
    - filter: LDAP filter for group searches.
    - userMatchers: Configuration for matching users to groups.
    - nameAttr: Attribute for the group name , this would map to orgnisation in openobserve , optionally this can be used to convey role information as well

#### OAuth2 Client Configuration

1. Static Clients
    - Define static clients that are allowed to authenticate with Dex.
    - Each client has:
        - name : Name of the client application for eg: `o2-client`
        - id : id of the client application for eg: `o2-client` 
        - secret : secret of client application 
        - redirectURIs : this should point to `<openobserve base url>/config/callback`, this is the uri to which dex redirect after a successful authentication. 
     

2. OAuth2 Configuration
    - responseTypes: Specifies OAuth2 response types, e.g., `code` for authorization code flow.
    - skipApprovalScreen: If set to true, Dex won't show an approval screen.

### Connecting Dex to LDAP
1. Deploy Dex: Deploy Dex in your Kubernetes cluster with the given configuration.
2. LDAP Connection: Ensure that Dex can reach the LDAP server (openldap:389 in this case).
3. Test Authentication: Test the authentication flow using one of the static clients.


## Setup OpenObserve with Dex
To enable SSO for OpenObserve using Dex, set the following environment variables:

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| O2_DEX_ENABLED                | false         | No            | Enables SSO in OpenObserve using Dex. |
| O2_DEX_CLIENT_ID              | -             | No            | Client id of static client |
| O2_DEX_CLIENT_SECRET          | -             | No            | Client secret of static client |
| O2_DEX_BASE_URL               | -             | No            | URL of the Dex identity provider |
| O2_CALLBACK_URL               | -             | No            | Set this value to `<openobserve base url>/web/cb`, after sucessful token received from dex, user will be redirected to this page   |
| O2_DEX_REDIRECT_URL           | -             | No            | Set this value to `<openobserve base url>/config/callback`, Should match to redirect uri specified in dex |
| O2_DEX_SCOPES                 | openid profile email groups offline_access | No            | scopes to be fetched from dex   |
| O2_DEX_GROUP_ATTRIBUTE        | ou            | No            | Maps user to OpenObserve organization. |
| O2_DEX_ROLE_ATTRIBUTE         | cn            | No            | User's role in the organization.|
| O2_DEX_DEFAULT_ORG            | default       | No            | Default organization for users not belonging to any group in ldap|

Configure these settings to integrate OpenObserve with Dex for a seamless SSO experience.
