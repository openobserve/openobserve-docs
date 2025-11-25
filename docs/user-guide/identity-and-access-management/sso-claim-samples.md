This guide shows real-world examples of identity claims from popular SSO providers and how to parse them using VRL (Vector Remap Language) functions in OpenObserve's custom claim parser.

## How to use this guide
Each section below shows:

1. **Example claims**: What your identity provider sends to OpenObserve
2. **VRL parser**: Code to convert those claims into OpenObserve organizations and roles
3. **What it does**: Plain explanation of the parsing logic

!!! tip "Testing your VRL functions"
    Before deploying, test your VRL functions:
    
    1. Go to the **Functions** page in your `_meta` organization.
    2. Create a new VRL function.
    3. Paste the VRL code.
    4. Click **Test Function** and provide sample claims JSON.
    5. Verify the output matches your expectations.


## AWS SSO/AWS IAM Identity Center

### What AWS sends
AWS SSO sends claims in several possible formats. Here are the most common:
<br>

**Example 1: Basic user with gGroups**

```json
{
  "sub": "92a3d123-4567-89ab-cdef-1234567890ab",
  "email": "john.doe@company.com",
  "email_verified": true,
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe",
  "preferred_username": "john.doe",
  "custom:groups": "engineering,admin,data-science",
  "cognito:groups": [
    "us-east-1_123ABC456_AWS",
    "Engineers",
    "DataTeam"
  ],
  "identities": [
    {
      "userId": "john.doe@company.com",
      "providerName": "AWS_SSO",
      "providerType": "SAML",
      "issuer": "https://portal.sso.us-east-1.amazonaws.com/saml/assertion/ABC123",
      "primary": true,
      "dateCreated": 1234567890123
    }
  ]
}
```
<br>

**Example 2: AWS SSO with permission sets**
```json
{
  "sub": "arn:aws:iam::123456789012:user/alice",
  "email": "alice@company.com",
  "name": "Alice Smith",
  "custom:environment": "production",
  "custom:department": "Platform",
  "custom:role": "DevOps Engineer",
  "custom:aws_accounts": "123456789012,987654321098",
  "custom:permission_sets": "AdministratorAccess,ReadOnlyAccess",
  "cognito:groups": [
    "AdminGroup",
    "PlatformTeam"
  ],
  "aws:organizations:account": "123456789012",
  "aws:organizations:ou": "ou-abc1-23456789"
}
```
**Example 3: AWS cognito user pool**
```json
{
  "sub": "a1b2c3d4-5678-90ab-cdef-EXAMPLE11111",
  "cognito:groups": [
    "Admins",
    "Developers"
  ],
  "email_verified": true,
  "cognito:username": "bob.wilson",
  "aud": "7example92example",
  "event_id": "f0e1d2c3-b4a5-9687-example",
  "token_use": "id",
  "auth_time": 1679500800,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example",
  "custom:tenant": "acme-corp",
  "custom:org_units": "finance,reporting",
  "custom:user_role": "analyst",
  "email": "bob.wilson@company.com",
  "exp": 1679504400,
  "iat": 1679500800
}
```
### How to parse AWS claims

This VRL function handles all three AWS formats above:
```vrl
# Parse AWS SSO claims
.orgs = []

# Extract groups from different AWS claim formats
groups = []

if exists(.cognito:groups) {
    groups = .cognito:groups
} else if exists(."custom:groups") {
    groups = split!(."custom:groups", ",")
}

# Map AWS groups to OpenObserve organizations and roles
for_each(array!(groups)) -> |_index, group| {
    if starts_with(group, "Admin") {
        .orgs = push(.orgs, {"org": "acme-prod", "role": "admin"})
    } else if starts_with(group, "Engineers") || starts_with(group, "Developers") {
        .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
    } else if contains(group, "DataTeam") || contains(group, "data-science") {
        .orgs = push(.orgs, {"org": "analytics", "role": "viewer"})
    }
}

# Check department-based access
if exists(."custom:department") {
    dept = downcase(."custom:department")
    if dept == "platform" {
        .orgs = push(.orgs, {"org": "infrastructure", "role": "admin"})
    }
}

.orgs
```

**What this does:**

1. Checks for groups in either `cognito:groups` array or `custom:groups` comma-separated string
2. Maps AWS groups to your OpenObserve organizations:

   - Groups starting with "Admin" > "acme-prod" org with admin role
   - "Engineers" or "Developers" > "engineering" org with editor role
   - Groups containing "DataTeam" or "data-science" > "analytics" org with viewer role
3. Checks custom department field and grants infrastructure admin access to Platform department


## Azure AD/Microsoft Entra ID

### What Azure AD sends

Azure AD typically sends groups as GUIDs and may include role information:

Example 1: Azure AD with groups
```json
{
  "aud": "12345678-1234-1234-1234-123456789012",
  "iss": "https://sts.windows.net/abcdef01-2345-6789-abcd-ef0123456789/",
  "iat": 1679500800,
  "nbf": 1679500800,
  "exp": 1679504400,
  "email": "sarah.jones@contoso.com",
  "name": "Sarah Jones",
  "oid": "98765432-abcd-ef01-2345-67890abcdef0",
  "preferred_username": "sarah.jones@contoso.com",
  "given_name": "Sarah",
  "family_name": "Jones",
  "sub": "AAAAAAAAAAAAAAAAAAAAABCDEFabcdef1234567890",
  "tid": "abcdef01-2345-6789-abcd-ef0123456789",
  "upn": "sarah.jones@contoso.com",
  "groups": [
    "a1b2c3d4-1111-2222-3333-444444444444",
    "e5f6g7h8-5555-6666-7777-888888888888"
  ],
  "roles": [
    "Global Administrator",
    "Security Reader"
  ],
  "wids": [
    "62e90394-69f5-4237-9190-012177145e10"
  ]
}
```
**Example 2: Azure AD with department info**
```json
{
  "email": "mike.brown@contoso.com",
  "name": "Mike Brown",
  "oid": "11111111-2222-3333-4444-555555555555",
  "preferred_username": "mike.brown@contoso.com",
  "given_name": "Mike",
  "family_name": "Brown",
  "jobTitle": "Senior Data Engineer",
  "department": "Data Platform",
  "companyName": "Contoso Corp",
  "officeLocation": "Building 5",
  "city": "Seattle",
  "country": "US",
  "groups": [
    "Engineering-DataPlatform",
    "DataEngineers",
    "ProductionAccess"
  ],
  "extension_abc123_TeamName": "Data Infrastructure",
  "extension_abc123_CostCenter": "CC-2024-DP",
  "extension_abc123_Environment": "Production"
}
```

### How to parse Azure AD claims
```vrl
# Parse Azure AD claims
.orgs = []

groups = array!(.groups)
roles = if exists(.roles) { array!(.roles) } else { [] }

# Map Azure AD groups to organizations
for_each(groups) -> |_index, group| {
    group_lower = downcase(to_string(group))

    if contains(group_lower, "dataplatform") || contains(group_lower, "dataengineers") {
        .orgs = push(.orgs, {"org": "data-platform", "role": "editor"})
    } else if contains(group_lower, "productionaccess") {
        .orgs = push(.orgs, {"org": "production", "role": "viewer"})
    }
}

# Check Azure AD roles
for_each(roles) -> |_index, role| {
    if contains(downcase(role), "administrator") {
        .orgs = push(.orgs, {"org": "admin", "role": "admin"})
    }
}

# Department-based access
if exists(.department) {
    dept = downcase(.department)
    if contains(dept, "data") {
        .orgs = push(.orgs, {"org": "analytics", "role": "editor"})
    } else if contains(dept, "engineering") {
        .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
    }
}

.orgs
```

**What this does:**

1. Converts group names to lowercase for case-insensitive matching
2. Maps group names to organizations:

   - Groups containing "dataplatform" or "dataengineers" > "data-platform" org with editor role
   - Groups containing "productionaccess" > "production" org with viewer role
3. Checks Azure AD roles and grants admin access to administrators
4. Uses department field to grant additional access to analytics or engineering orgs

---

## Okta

### What Okta sends

Okta can send claims via OIDC or SAML:

Example 1: Okta OIDC with Groups
```json
{
  "sub": "00u1a2b3c4d5e6f7g8h9",
  "name": "Emily Davis",
  "locale": "en-US",
  "email": "emily.davis@example.com",
  "ver": 1,
  "iss": "https://dev-123456.okta.com/oauth2/default",
  "aud": "0oa9876543210xyz",
  "iat": 1679500800,
  "exp": 1679504400,
  "jti": "ID.abc123def456ghi789",
  "amr": ["pwd", "mfa"],
  "idp": "00o1a2b3c4d5e6f7g8h9",
  "nonce": "abc123",
  "preferred_username": "emily.davis@example.com",
  "given_name": "Emily",
  "family_name": "Davis",
  "zoneinfo": "America/Los_Angeles",
  "updated_at": 1679500000,
  "email_verified": true,
  "groups": [
    "Engineering",
    "Data-Scientists",
    "Production-Users",
    "Team-Lead"
  ],
  "department": "Machine Learning",
  "title": "ML Engineer",
  "organization": "AI Division"
}
```
**Example 2: Okta SAML Assertions**

```json
{
  "nameID": "emily.davis@example.com",
  "nameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "sessionIndex": "_abc123def456",
  "attributes": {
    "firstName": "Emily",
    "lastName": "Davis",
    "email": "emily.davis@example.com",
    "groups": [
      "okta-eng-team",
      "okta-ml-team",
      "okta-prod-access"
    ],
    "userType": "Employee",
    "department": "Engineering",
    "costCenter": "ENG-ML-2024",
    "manager": "john.manager@example.com",
    "environment": ["staging", "production"]
  }
}
```

### How to parse Okta claims
```vrl
# Parse Okta claims
.orgs = []

# Handle both OIDC and SAML formats
groups = if exists(.groups) {
    array!(.groups)
} else if exists(.attributes.groups) {
    array!(.attributes.groups)
} else {
    []
}

# Map Okta groups to organizations
for_each(groups) -> |_index, group| {
    group_lower = downcase(to_string(group))

    if contains(group_lower, "data-scientist") || contains(group_lower, "ml-team") {
        .orgs = push(.orgs, {"org": "ml-platform", "role": "editor"})
    } else if contains(group_lower, "team-lead") {
        .orgs = push(.orgs, {"org": "engineering", "role": "admin"})
    } else if contains(group_lower, "prod-access") || contains(group_lower, "production-users") {
        .orgs = push(.orgs, {"org": "production", "role": "viewer"})
    } else if contains(group_lower, "engineering") {
        .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
    }
}

# Check title for admin access
if exists(.title) || exists(.attributes.title) {
    title = downcase(if exists(.title) { .title } else { .attributes.title })
    if contains(title, "senior") || contains(title, "lead") {
        .orgs = push(.orgs, {"org": "senior-staff", "role": "editor"})
    }
}

.orgs
```

**What this does:**

1. Detects whether claims are in OIDC format (`.groups`) or SAML format (`.attributes.groups`)
2. Maps Okta groups:

   - "data-scientist" or "ml-team" > "ml-platform" org with editor role
   - "team-lead" > "engineering" org with admin role
   - "prod-access" or "production-users" > "production" org with viewer role
3. Checks job title and grants senior staff access to users with "senior" or "lead" in their title


## Google Workspace

### What Google sends
Google OAuth returns basic profile information and may include custom attributes:

<br>
**Example 1: Google OAuth claims**

```json
{
  "iss": "https://accounts.google.com",
  "azp": "123456789-abcdefg.apps.googleusercontent.com",
  "aud": "123456789-abcdefg.apps.googleusercontent.com",
  "sub": "123456789012345678901",
  "hd": "company.com",
  "email": "tom.wilson@company.com",
  "email_verified": true,
  "at_hash": "abc123def456",
  "name": "Tom Wilson",
  "picture": "https://lh3.googleusercontent.com/a/default-user",
  "given_name": "Tom",
  "family_name": "Wilson",
  "locale": "en",
  "iat": 1679500800,
  "exp": 1679504400
}
```
**Example 2: Google with custom attributes**
```json
{
  "email": "lisa.chen@company.com",
  "email_verified": true,
  "name": "Lisa Chen",
  "given_name": "Lisa",
  "family_name": "Chen",
  "hd": "company.com",
  "sub": "109876543210987654321",
  "picture": "https://lh3.googleusercontent.com/a/photo",
  "google_groups": [
    "engineering@company.com",
    "data-platform@company.com",
    "admins@company.com"
  ],
  "ou": "/Engineering/DataPlatform",
  "employee_id": "EMP-12345",
  "department": "Engineering",
  "cost_center": "ENG-DP"
}
```

### How to parse Google claims

```vrl
.orgs = []

# Check hosted domain
if exists(.hd) {
    domain = .hd
    if domain == "company.com" {
        # Email domain based routing
        email_parts = split!(.email, "@")
        username = email_parts[0]

        # Google groups
        if exists(.google_groups) {
            groups = array!(.google_groups)
            for_each(groups) -> |_index, group| {
                if contains(group, "admins@") {
                    .orgs = push(.orgs, {"org": "admin", "role": "admin"})
                } else if contains(group, "engineering@") {
                    .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
                } else if contains(group, "data-platform@") {
                    .orgs = push(.orgs, {"org": "data-platform", "role": "editor"})
                }
            }
        }

        # OU-based access
        if exists(.ou) {
            ou = downcase(.ou)
            if contains(ou, "dataplatform") {
                .orgs = push(.orgs, {"org": "analytics", "role": "editor"})
            }
        }
    }
}

if length(.orgs) == 0 {
    .orgs = push(.orgs, {"org": "default", "role": "viewer"})
}

.orgs
```

**What this does:**

1. Verifies the user belongs to your Google Workspace domain (`hd` field)
2. Checks Google Groups membership:

   - "admins@" > "admin" org with admin role
   - "engineering@" > "engineering" org with editor role
   - "data-platform@" > "data-platform" org with editor role
3. Uses organizational unit (OU) path for additional access
4. Provides fallback to "default" org with viewer role if no groups match



## Auth0

### What Auth0 sends
**Example: Auth0 with app metadata**

```json
{
  "iss": "https://company.auth0.com/",
  "sub": "auth0|5f1a2b3c4d5e6f7g8h9i0",
  "aud": [
    "https://api.company.com",
    "abc123xyz789"
  ],
  "iat": 1679500800,
  "exp": 1679504400,
  "azp": "abc123xyz789",
  "scope": "openid profile email",
  "email": "david.park@company.com",
  "email_verified": true,
  "name": "David Park",
  "nickname": "david.park",
  "picture": "https://s.gravatar.com/avatar/abc123",
  "updated_at": "2024-03-22T10:00:00.000Z",
  "https://company.com/roles": [
    "data-engineer",
    "senior-staff",
    "production-access"
  ],
  "https://company.com/permissions": [
    "read:logs",
    "write:logs",
    "admin:dashboards"
  ],
  "https://company.com/groups": [
    "engineering",
    "data-team",
    "oncall"
  ],
  "https://company.com/app_metadata": {
    "organization": "data-platform",
    "department": "Engineering",
    "cost_center": "ENG-2024",
    "teams": ["streaming", "batch", "infra"]
  },
  "https://company.com/user_metadata": {
    "timezone": "America/Los_Angeles",
    "preferences": {
      "theme": "dark"
    }
  }
}
```

### How to parse Auth0 claims
```vrl
# Parse Auth0 claims with custom namespaces
.orgs = []

# Auth0 uses namespaced claims
namespace = "https://company.com/"

# Extract roles
roles_claim = namespace + "roles"
if exists(get!(., [roles_claim])) {
    roles = array!(get!(., [roles_claim]))
    for_each(roles) -> |_index, role| {
        role_lower = downcase(role)
        if contains(role_lower, "data-engineer") {
            .orgs = push(.orgs, {"org": "data-engineering", "role": "editor"})
        } else if contains(role_lower, "senior-staff") {
            .orgs = push(.orgs, {"org": "engineering", "role": "admin"})
        } else if contains(role_lower, "production-access") {
            .orgs = push(.orgs, {"org": "production", "role": "viewer"})
        }
    }
}

# Extract groups
groups_claim = namespace + "groups"
if exists(get!(., [groups_claim])) {
    groups = array!(get!(., [groups_claim]))
    for_each(groups) -> |_index, group| {
        if group == "data-team" {
            .orgs = push(.orgs, {"org": "analytics", "role": "editor"})
        } else if group == "oncall" {
            .orgs = push(.orgs, {"org": "ops", "role": "admin"})
        }
    }
}

# Check app metadata
app_meta_claim = namespace + "app_metadata"
if exists(get!(., [app_meta_claim])) {
    app_meta = object!(get!(., [app_meta_claim]))
    if exists(app_meta.teams) {
        teams = array!(app_meta.teams)
        for_each(teams) -> |_index, team| {
            .orgs = push(.orgs, {"org": team, "role": "editor"})
        }
    }
}

.orgs
```

**What this does:**

1. Auth0 requires accessing namespaced claims with the full URL.
2. Extracts roles from `https://company.com/roles` claim.
3. Extracts groups from `https://company.com/groups` claim.
4. Reads app metadata to create organization assignments based on team membership.
5. Each team in app metadata gets its own organization with editor role.

---

## Keycloak

### What Keycloak sends

**Example 1: Keycloak with Realm Roles**
```json
{
  "exp": 1679504400,
  "iat": 1679500800,
  "auth_time": 1679500800,
  "jti": "a1b2c3d4-1234-5678-90ab-cdef12345678",
  "iss": "https://keycloak.company.com/realms/company",
  "aud": "openobserve-client",
  "sub": "f1e2d3c4-5678-90ab-cdef-123456789abc",
  "typ": "ID",
  "azp": "openobserve-client",
  "session_state": "abc123-def456-ghi789",
  "acr": "1",
  "email_verified": true,
  "name": "Rachel Green",
  "preferred_username": "rachel.green",
  "given_name": "Rachel",
  "family_name": "Green",
  "email": "rachel.green@company.com",
  "realm_access": {
    "roles": [
      "offline_access",
      "uma_authorization",
      "data_engineer",
      "production_viewer"
    ]
  },
  "resource_access": {
    "openobserve-client": {
      "roles": [
        "admin",
        "editor"
      ]
    },
    "account": {
      "roles": [
        "manage-account",
        "view-profile"
      ]
    }
  },
  "groups": [
    "/engineering",
    "/engineering/data-platform",
    "/production-users"
  ],
  "attributes": {
    "department": ["Engineering"],
    "team": ["Data Platform", "Streaming"],
    "location": ["US-West"]
  }
}
```

### How to parse Keycloak claims
```vrl
# Parse Keycloak claims
.orgs = []

# Realm roles
if exists(.realm_access.roles) {
    realm_roles = array!(.realm_access.roles)
    for_each(realm_roles) -> |_index, role| {
        role_lower = downcase(role)
        if contains(role_lower, "data_engineer") {
            .orgs = push(.orgs, {"org": "data-engineering", "role": "editor"})
        } else if contains(role_lower, "production_viewer") {
            .orgs = push(.orgs, {"org": "production", "role": "viewer"})
        }
    }
}

# Client-specific roles
if exists(.resource_access."openobserve-client".roles) {
    client_roles = array!(.resource_access."openobserve-client".roles)
    for_each(client_roles) -> |_index, role| {
        if role == "admin" {
            .orgs = push(.orgs, {"org": "admin", "role": "admin"})
        } else if role == "editor" {
            .orgs = push(.orgs, {"org": "default", "role": "editor"})
        }
    }
}

# Groups (hierarchical)
if exists(.groups) {
    groups = array!(.groups)
    for_each(groups) -> |_index, group| {
        if contains(group, "data-platform") {
            .orgs = push(.orgs, {"org": "data-platform", "role": "editor"})
        } else if starts_with(group, "/production-") {
            .orgs = push(.orgs, {"org": "production", "role": "viewer"})
        } else if starts_with(group, "/engineering") {
            .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
        }
    }
}

# Custom attributes
if exists(.attributes.team) {
    teams = array!(.attributes.team)
    for_each(teams) -> |_index, team| {
        team_slug = replace(downcase(team), " ", "-")
        .orgs = push(.orgs, {"org": team_slug, "role": "editor"})
    }
}

.orgs
```

**What this does:**

1. Checks realm-level roles assigned to the user.
2. Checks client-specific roles (roles assigned for the OpenObserve client specifically).
3. Parses hierarchical group structure (groups starting with `/`).
4. Reads custom attributes and creates organization assignments based on team membership.
5. Converts team names to URL-friendly slugs (For example, "Data Platform" becomes "data-platform").

---

## Generic SAML

### What SAML providers send

**Example: SAML assertion attributes**

```json
{
  "nameID": "user@company.com",
  "nameIDFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:email",
  "sessionIndex": "_abc123def456ghi789",
  "attributes": {
    "email": "user@company.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "displayName": "Jane Smith",
    "uid": "jsmith",
    "eduPersonAffiliation": ["employee", "member"],
    "eduPersonPrincipalName": "jsmith@company.com",
    "groups": "engineering;data-team;production",
    "department": "Engineering",
    "title": "Staff Engineer",
    "employeeNumber": "12345",
    "organizationUnit": "Data Platform",
    "roles": "DataEngineer,ProductionAccess,TeamLead"
  }
}
```

### How to parse SAML claims
```vrl
# Parse generic SAML attributes
.orgs = []

attrs = object!(.attributes)

# Handle delimited groups
if exists(attrs.groups) {
    groups_str = to_string(attrs.groups)
    # Try semicolon delimiter
    groups = if contains(groups_str, ";") {
        split(groups_str, ";")
    } else if contains(groups_str, ",") {
        split(groups_str, ",")
    } else {
        [groups_str]
    }

    for_each(groups) -> |_index, group| {
        group_clean = strip_whitespace(downcase(group))
        if group_clean == "data-team" {
            .orgs = push(.orgs, {"org": "data", "role": "editor"})
        } else if group_clean == "production" {
            .orgs = push(.orgs, {"org": "production", "role": "viewer"})
        } else if group_clean == "engineering" {
            .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
        }
    }
}

# Handle delimited roles
if exists(attrs.roles) {
    roles_str = to_string(attrs.roles)
    roles = split(roles_str, ",")
    for_each(roles) -> |_index, role| {
        if contains(downcase(role), "teamlead") {
            .orgs = push(.orgs, {"org": "engineering", "role": "admin"})
        }
    }
}

# OU-based access
if exists(attrs.organizationUnit) {
    ou = downcase(to_string(attrs.organizationUnit))
    if contains(ou, "data") {
        .orgs = push(.orgs, {"org": "analytics", "role": "editor"})
    }
}

.orgs
```

**What this does:**

1. Detects delimiter type (semicolon or comma) in group strings
2. Splits delimited strings into arrays
3. Trims whitespace from each value
4. Maps groups and roles to organizations
5. Uses organizational unit for additional access assignments

---

## LDAP

### What LDAP sends

**Example: LDAP User Attributes**

```json
{
  "dn": "cn=John Doe,ou=Engineering,ou=Users,dc=company,dc=com",
  "cn": "John Doe",
  "sn": "Doe",
  "givenName": "John",
  "mail": "john.doe@company.com",
  "uid": "jdoe",
  "employeeNumber": "98765",
  "employeeType": "Full-Time",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "ou": "Engineering",
  "memberOf": [
    "cn=Engineers,ou=Groups,dc=company,dc=com",
    "cn=DataPlatform,ou=Groups,dc=company,dc=com",
    "cn=ProductionAccess,ou=Groups,dc=company,dc=com",
    "cn=OnCall,ou=Groups,dc=company,dc=com"
  ],
  "manager": "cn=Jane Manager,ou=Engineering,ou=Users,dc=company,dc=com",
  "telephoneNumber": "+1-555-1234",
  "l": "San Francisco",
  "c": "US"
}
```

### How to parse LDAP claims
```vrl
# Parse LDAP attributes
.orgs = []

# Parse memberOf groups
if exists(.memberOf) {
    member_of = array!(.memberOf)
    for_each(member_of) -> |_index, dn| {
        # Extract CN from DN (e.g., "cn=Engineers,ou=Groups,..." -> "Engineers")
        if contains(dn, "cn=") {
            parts = split(dn, ",")
            cn_part = parts[0]
            group_name = downcase(replace(cn_part, "cn=", ""))

            if group_name == "engineers" {
                .orgs = push(.orgs, {"org": "engineering", "role": "editor"})
            } else if group_name == "dataplatform" {
                .orgs = push(.orgs, {"org": "data-platform", "role": "editor"})
            } else if group_name == "productionaccess" {
                .orgs = push(.orgs, {"org": "production", "role": "viewer"})
            } else if group_name == "oncall" {
                .orgs = push(.orgs, {"org": "ops", "role": "admin"})
            }
        }
    }
}

# Department-based access
if exists(.department) {
    dept = downcase(.department)
    .orgs = push(.orgs, {"org": dept, "role": "editor"})
}

# Title-based admin access
if exists(.title) {
    title = downcase(.title)
    if contains(title, "senior") || contains(title, "lead") || contains(title, "principal") {
        .orgs = push(.orgs, {"org": "senior-staff", "role": "editor"})
    }
}

.orgs
```

**What this does:**

1. Parses LDAP distinguished names from `memberOf` attribute.
2. Extracts the CN (common name) from each DN.
3. Maps LDAP groups to OpenObserve organizations.
4. Uses department field to create department-based organization access.
5. Grants senior staff access based on job title.

---

## Advanced use cases

### Use Case 1: Dynamic org creation based on email domain

```vrl
# Extract domain from email and use as org
email = .email
if exists(email) {
    parts = split!(email, "@")
    domain = parts[1]
    domain_parts = split(domain, ".")
    org_name = domain_parts[0]

    .orgs = [{"org": org_name, "role": "viewer"}]
}
```

### Use Case 2: Multi-tenancy with tenant ID

```vrl
# Route users to tenant-specific orgs
tenant_id = if exists(.tenant_id) {
    .tenant_id
} else if exists(."custom:tenant") {
    ."custom:tenant"
} else if exists(.attributes.tenant) {
    .attributes.tenant
} else {
    "default"
}

# Create tenant-scoped org names
.orgs = [
    {"org": "tenant-" + tenant_id + "-prod", "role": "viewer"},
    {"org": "tenant-" + tenant_id + "-dev", "role": "editor"}
] 
```

### Use Case 3: Time-based access control

```vrl
# Grant access based on current time or claim timestamps
current_time = now()
auth_time = to_timestamp!(.auth_time)

# Only allow recently authenticated users
if current_time - auth_time < 3600 {  # Within last hour
    .orgs = [{"org": "sensitive-data", "role": "viewer"}]
} else {
    .orgs = [{"org": "general", "role": "viewer"}]
}
```

### Use Case 4: Conditional access denial

Deny login based on account status:
```vrl
# Deny access if certain conditions are met
if exists(.suspended) && .suspended == true {
    .deny = true
    .reason = "Account is suspended"
} else if exists(.email_verified) && .email_verified == false {
    .deny = true
    .reason = "Email not verified"
} else {
    .orgs = [{"org": "default", "role": "viewer"}]
}
```


## Query errors

To monitor claim parsing errors:

```sql
SELECT * FROM errors
WHERE pipeline_name = 'sso_claim_parser'
ORDER BY _timestamp DESC
LIMIT 100
```

View errors by type:
```sql
SELECT error_type, count(*) as count
FROM errors
WHERE pipeline_name = 'sso_claim_parser'
GROUP BY error_type
```

## Best Practices

1. **Always handle missing fields**: Use `exists()` checks before accessing claims
2. **Normalize case**: Use `downcase()` for string comparisons
3. **Provide fallback**: Always return at least one org assignment or explicit deny
4. **Log context**: Errors automatically include claims JSON for debugging
5. **Test thoroughly**: Use the VRL testing UI with real claim samples
6. **Handle arrays**: Use `array!()` to safely convert claims to arrays
7. **Trim whitespace**: Use `strip_whitespace()` when parsing delimited strings