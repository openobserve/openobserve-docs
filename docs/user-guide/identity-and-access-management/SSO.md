---
title: Single Sign-On (SSO) 
description: Learn how to enable Single Sign-On (SSO) in OpenObserve.
---
<!-- search: SSO, Single Sign-On-->

> `Applicable to enterprise version`

OpenObserve, integrates Single Sign-On (SSO) capabilities using Dex, an OpenID Connect Identity (OIDC) and OAuth 2.0 provider. Dex does not have a user database and instead uses external identity providers like LDAP, Google, GitHub, etc. for authentication.

## Setup OpenObserve

You must set following environment variables to enable SSO in OpenObserve.

values.yaml
```yaml
config:
  O2_DEX_CLIENT_ID: "o2-client"	# Client id of static client
  O2_DEX_CLIENT_SECRET: "ZXhhbXBsZS1hcHAtc2VjcmV0"	 # This should be base64 encoded value of client secret 
  O2_DEX_BASE_URL: "https://dex.example.com/dex"	# URL of the Dex identity provider
  O2_DEX_REDIRECT_URL: "https://openobserve.example.com/config/redirect"	# Should match to redirect uri specified in dex
  O2_CALLBACK_URL: "https://openobserve.example.com/web/cb"	# after sucessful token received from dex, user will be redirected to this page
  O2_DEX_SCOPES: "openid profile email groups offline_access"	# scopes to be fetched from dex
  O2_DEX_GROUP_ATTRIBUTE: "ou"	# Maps user to OpenObserve organization.
  O2_DEX_ROLE_ATTRIBUTE: "cn"	# User's role in the organization.
  O2_DEX_DEFAULT_ORG: "default"	# Default organization for users not belonging to any group in ldap
```

## Setup Dex
The following sections detail the configuration settings for Dex.

### Dex base configuration

values.yaml
```yaml
enterprise:
  enabled: true
  dex:
    enabled: true
    config: 
      issuer: https://dex.example.com/dex	# issuer url of Dex. This is used by clients to discover OIDC endpoints.
      storage:
        type: kubernetes
        config:
          inCluster: true
      web:
        http: 0.0.0.0:5556	# Dex's HTTP server endpoint. In this case, it listens on all interfaces (0.0.0.0) and port 5556.
      expiry:
        idTokens: 10m	# Expiration time for ID tokens (10 minutes).
        refreshTokens:
          validIfNotUsedFor: 30m	# Refresh tokens are valid if they haven't been used for 30 minutes.
      staticClients:	# Define static clients that are allowed to authenticate with Dex.
      - id: o2-client
        redirectURIs:
        - https://openobserve.example.com/config/redirect
        name: o2-client
        secret: ZXhhbXBsZS1hcHAtc2VjcmV0 # This should be base64 encoded value of client secret and must be same that you set in config.O2_DEX_CLIENT_SECRET
      oauth2:	# OAuth2 Client Configuration
        responseTypes:
        - code
        skipApprovalScreen: true
```

In order to use Dex you must set both `enterprise.enabled` and `enterprise.dex.enabled` to `true` in the values.yaml file. 

In addition to that you would also want to use ingress to expose dex external to your kubernetes cluster.

### Dex connector configuration

#### LDAP

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
    - nameAttr: Attribute for the group name , this would map to organization in openobserve , optionally this can be used to convey role information as well

A sample configuration detailing server connection, bind credentials, user and group search settings.

values.yaml
```yaml
	connectors:
        - type: ldap
          name: OpenLDAP
          id: ldap
          config:
            host: openldap:389
            insecureNoSSL: true
            bindDN: cn=admin,dc=o2,dc=ai
            bindPW: Z54H7w5WQUARsLKaumM967iX62msTEno
            usernamePrompt: Email Address
            userSearch:
              baseDN: ou=users,dc=o2,dc=ai
              filter: "(objectClass=inetOrgPerson)"
              username: mail
              idAttr: DN
              emailAttr: mail
              nameAttr: cn
            groupSearch:
              baseDN: ou=teams,dc=o2,dc=ai
              filter: "(objectClass=groupOfUniqueNames)"
              userMatchers:
              - userAttr: DN
                groupAttr: uniqueMember
              nameAttr: entryDN

```

**LDAP configuration Example**

This section provides a practical example of configuring LDAP for use with Dex and OpenObserve, including creating organizational units, adding users, and defining roles.
For ldap configuration the example uses organizational units (OUs) for users and teams, adding individual users, and then creating specific groups within a team. Here's a detailed explanation of each part of the configuration:

**Creating Organizational Units (OUs)**
 
**To create OU for Users:**

- DN (Distinguished Name): 
    - `dn: ou=users,dc=example,dc=com`  DN specifies the unique identifier for the OU. Here, it's creating an OU named "users" under the domain example.com
- Object Class: 
    - `objectClass: organizationalUnit`
    This defines the type of object, which is an organizational unit.
- Name:
     - `ou: users`
     Sets the name of the OU.
- Description: 
    - `description: Organizational Unit for Users`
    A brief description of the OU's purpose.

**To create OU for Teams:**
Follow the same structure as the Users OU, but for creating a "teams" OU.


**Adding a User**

To add User Ashish:

- DN:
    - `dn: uid=ashish,ou=users,dc=example,dc=com` ,Places the user "ashish" inside the "users" OU.
- Object Class:
    - `objectClass: inetOrgPerson`
     Used for individual people, allowing for attributes like name, email, etc.
- Attributes:

    - `uid: ashish` - User ID.
    - `cn: ashish` - Common name .
    - `mail: ashish@example.com` - Email address.
    - `userPassword: Pass@123` - Password for the user account,Please set appropriate value.

**Creating a Sub-Organizational Unit for a Team**

OU for Team1:

- DN: 
    `dn: ou=team1,ou=teams,dc=example,dc=com`
    Creates a sub-OU "team1" within the "teams" OU.
- Object Class: 
    `objectClass: organizationalUnit`
- Attributes:
    - `ou: team1` - Name of the sub-OU.
    - `description: Organizational Unit for Team 1` - Description of the sub-OU's purpose.

**Creating Roles within the Team1 OU**

Admin Role:

- DN: 
    `dn: cn=admin,ou=team1,ou=teams,dc=example,dc=com`
    Defines the DN for a group named "admin" within the "team1" OU, which is under the "teams" OU.
- Object Class: 
    `objectClass: groupOfUniqueNames`
    This object class is used for groups where members are uniquely identified.
- Attributes:
    - `cn: admin` - Common name of the group.
    - `uniqueMember: uid=ashish,ou=users,dc=example,dc=com` - Specifies that the user "ashish" is a member of this group.

Editor Role:

- DN: 
    `dn: cn=editor,ou=team1,ou=teams,dc=example,dc=com`
    Similar to the admin group, this creates a group named "editor" within "team1."
- Object Class: 
    `objectClass: groupOfUniqueNames`
    This object class is used for groups where members are uniquely identified.    
- Attributes:
    - `cn: editor` - Common name of the group.
    - `uniqueMember: uid=prabhat,ou=users,dc=example,dc=com`- Specifies that the user "prabhat" is a member of this group.


The LDAP configuration outlined above demonstrates a structured approach to organizing an enterprise's directory services. It starts with broad categorizations (Users and Teams OUs) and then delves into finer details (individual users and specific roles within teams). Such a structured LDAP setup is essential for efficient management of user identities, roles, and access control within an organization, and it seamlessly integrates with OpenObserve and Dex for robust SSO functionality.

#### OIDC

This section demonstrates how to configure Dex to authenticate users using Google as an OpenID Connect (OIDC) provider. The configuration involves specifying various parameters that establish a secure connection between Dex, Google, and your application.

OIDC Server Connection Configuration

1. Connector Details
    - `type: oidc`
    - `id: google` -  This sets a unique identifier for this specific connector. Here, google is used as the ID.
    - `name: Google` -  human-readable name for the connector

1. Configuration Parameters

    - `issuer: https://accounts.google.com` - issuer is the URL of the OpenID provider. It tells Dex where to send authentication requests. For Google, this is always https://accounts.google.com.
    - `clientID: <YOUR-CLIENT-ID>` - clientID is the OAuth 2.0 Client ID you obtain from your Google Cloud Console when you set up your OAuth credentials. This ID uniquely identifies your application to Google.
    - `clientSecret: <YOUR-CLIENT-SECRET>` - clientSecret is a secret key you obtain along with the Client ID from Google. It's used to authenticate the identity of the application to Google when Dex exchanges the authorization code for an access token.
    - `redirectURI: http://<DEX-SERVER>/callback` - redirectURI is the URL where users will be sent after they authenticate with Google. This must match one of the Authorized redirect URIs you specified in the Google Cloud Console. It usually points to a URI on your Dex server that will handle the OAuth2 callback.
    - `scopes:` list of the scopes (permissions) that Dex will request from OIDC provider.
        - email 
        - profile
        - openid
    - `getUserInfo: true` - Tells Dex to make an additional request to Google's UserInfo endpoint to get more detailed user information (like the user's full profile). This is often necessary when the ID token does not contain all the information your application needs.

    - `claimMapping:`
        - email: email -  Map 'email' claim from Google to 'email' claim in Dex
        - name: name -  Map 'name' claim from Google to 'name' claim in Dex

values.yaml
```yaml
connectors:
- type: oidc
  id: google
  name: Google
  config:
    issuer: https://accounts.google.com
    clientID: <APP-CLIENT-ID>
    clientSecret: <APP-CLIENT-SECRET>
    redirectURI: https://dex.example.com/dex/callback
    scopes:
      - email
      - profile
      - openid
    getUserInfo: true
    claimMapping:
      email: email
      name: name

```     




