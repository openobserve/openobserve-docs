> `Applicable to enterprise version`

OpenObserve, integrates Single Sign-On (SSO) capabilities using Dex, an OpenID Connect Identity (OIDC) and OAuth 2.0 provider. Dex does not have a user database and instead uses external identity providers like LDAP, Google, GitHub, etc. for authentication.

## Prerequisites
- A Kubernetes cluster.
- Familiarity with Dex
- An LDAP server, like OpenLDAP, accessible from within the cluster.
- Familiarity with Kubernetes and LDAP.

## Setup Dex
This section outlines configuring Dex.

## Dex Configuration

1. Issuer URL
    - issuer: issuer url of Dex. This is used by clients to discover OIDC endpoints.
    - Example: https://{dex-host}/dex . https://auth.example.com/dex
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

#### OAuth2 Client Configuration

1. Static Clients
    - Define static clients that are allowed to authenticate with Dex.
    - Each client has:
        - name : Name of the client application for eg: `openobserve-client`
        - id : id of the client application for eg: `openobserve-client` 
        - secret : secret of client application 
        - redirectURIs : this should point to `<openobserve base url>/config/callback`, this is the uri to which dex redirect after a successful authentication. 
     

2. OAuth2 Configuration
    - responseTypes: Specifies OAuth2 response types, e.g., `code` for authorization code flow.
    - skipApprovalScreen: If set to true, Dex won't show an approval screen.


Dex configuration sample
 
    
    issuer: https://auth.example.com/dex 
    storage:
      type: kubernetes
      config:
        inCluster: true
    web:
      http: 0.0.0.0:5556
    expiry:
      idTokens: 10m
      refreshTokens:
        validIfNotUsedFor: 30m
    staticClients:
    - id: 'openobserve-client'
      redirectURIs:
      - 'https://openobserve.example.com/config/callback'
      name: 'openobserve-client'
      secret: ComplexSecret#123

    #Configure for PKCE flow
    oauth2:
      responseTypes: ["code"]
      skipApprovalScreen: true    


## Setup LDAP
This section outlines configuring LDAP as an authentication backend for dex.

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

A sample configuration detailing server connection, bind credentials, user and group search settings.

    connectors:
    - type: ldap
    name: OpenLDAP
    id: ldap
    config:
        # 1 Plain LDAP, without TLS:
        host: localhost:389
        insecureNoSSL: true
    
        # This would normally be a read-only user.
        bindDN: cn=admin,dc=example,dc=com
        bindPW: admin

        usernamePrompt: Email Address

        userSearch:
        baseDN: ou=users,dc=example,dc=com
        filter: "(objectClass=inetOrgPerson)"
        username: mail
        # "DN" (case sensitive) is a special attribute name. It indicates that
        # this value should be taken from the entity's DN not an attribute on
        # the entity.
        idAttr: DN
        emailAttr: mail
        nameAttr: cn

        groupSearch:
        baseDN: ou=teams,dc=example,dc=com
        filter: "(objectClass=groupOfUniqueNames)"

        userMatchers:
            # A user is a member of a group when their DN matches
            # the value of a "member" attribute on the group entity.
        - userAttr: DN
            groupAttr: uniqueMember

        # The group name should be the "cn" value.
        nameAttr: entryDN



### Connecting Dex to LDAP
1. Deploy Dex: Deploy Dex in your Kubernetes cluster with the given configuration.
2. LDAP Connection: Ensure that Dex can reach the LDAP server (openldap:389 in this case).
3. Test Authentication: Test the authentication flow using one of the static clients.


## Setup OpenObserve with Dex
To enable SSO for OpenObserve using Dex, set the following environment variables:

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| O2_DEX_ENABLED                | false         | Yes           | Enables SSO in OpenObserve using Dex. |
| O2_DEX_CLIENT_ID              | -             | Yes           | Client id of static client |
| O2_DEX_CLIENT_SECRET          | -             | Yes           | Client secret of static client |
| O2_DEX_BASE_URL               | -             | Yes           | URL of the Dex identity provider |
| O2_CALLBACK_URL               | -             | Yes           | Set this value to `<openobserve base url>/web/cb`, after sucessful token received from dex, user will be redirected to this page   |
| O2_DEX_REDIRECT_URL           | -             | Yes           | Set this value to `<openobserve base url>/config/callback`, Should match to redirect uri specified in dex |
| O2_DEX_SCOPES                 | openid profile email groups offline_access | No            | scopes to be fetched from dex   |
| O2_DEX_GROUP_ATTRIBUTE        | ou            | No            | Maps user to OpenObserve organization. |
| O2_DEX_ROLE_ATTRIBUTE         | cn            | No            | User's role in the organization.|
| O2_DEX_DEFAULT_ORG            | default       | No            | Default organization for users not belonging to any group in ldap|

Configure these settings to integrate OpenObserve with Dex for a seamless SSO experience.

## LDAP configuration Example

This section provides a practical example of configuring LDAP for use with Dex and OpenObserve, including creating organizational units, adding users, and defining roles.
For ldap configuration the example uses organizational units (OUs) for users and teams, adding individual users, and then creating specific groups within a team. Here's a detailed explanation of each part of the configuration:

### Creating Organizational Units (OUs)
#### To create OU for Users:

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

#### To create OU for Teams:
Follow the same structure as the Users OU, but for creating a "teams" OU.


####  Adding a User

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

#### Creating a Sub-Organizational Unit for a Team

OU for Team1:

- DN: 
    `dn: ou=team1,ou=teams,dc=example,dc=com`
    Creates a sub-OU "team1" within the "teams" OU.
- Object Class: 
    `objectClass: organizationalUnit`
- Attributes:
    - `ou: team1` - Name of the sub-OU.
    - `description: Organizational Unit for Team 1` - Description of the sub-OU's purpose.

####  Creating Roles within the Team1 OU

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
