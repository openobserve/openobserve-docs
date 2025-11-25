This document provides a conceptual understanding of how claim parsing is performed, how claims are mapped to organizations and roles, and how the system uses VRL to interpret identity information received from external identity providers.

!!! note "Note"
    This feature is available in the Enterprise Edition only.

## Overview
OpenObserve supports Single Sign On with Dex for authentication and OpenFGA for authorization. Single Sign On allows users to log in to OpenObserve using their existing corporate identity. The actual authentication is performed by an external identity provider. An external identity provider is a system that manages user identities and issues secure login tokens.

!!! note "When a user logs in, the following sequence takes place:"

    1. The user selects Single Sign On on the OpenObserve login page.
    2. OpenObserve redirects the user to the external identity provider through Dex.
    3. The external identity provider authenticates the user.
    4. After successful authentication, the identity provider returns an ID token to Dex. The ID token contains the user’s identity details, such as email, name, groups, roles, or other attributes. These values are called **claims**.
    5. OpenObserve receives the claims and determines which OpenObserve organization and role the user should be assigned to.

    Different identity providers use different claim formats. OpenObserve must convert these claims into the correct organization and role assignments inside OpenObserve. These assignments determine which OpenObserve organization the user belongs to and what the user can access.


## Required configuration

### Dex connection (required)
```bash
O2_DEX_ENABLED=true                                    # Enable SSO
O2_DEX_BASE_URL="http://127.0.0.1:5556/dex"            # Dex server URL
O2_DEX_CLIENT_ID="openobserve"                         # OAuth2 client ID
O2_DEX_CLIENT_SECRET="secret"                          # OAuth2 client secret
O2_DEX_REDIRECT_URL="http://localhost:5080/callback"   # OAuth2 callback URL
O2_DEX_SCOPES="openid profile email groups offline_access"
```

### OpenFGA authorization (required)
```bash
O2_OPENFGA_ENABLED=true                                # Enable fine-grained authz
O2_OPENFGA_BASE_URL="http://127.0.0.1:8080/stores"     # OpenFGA server
O2_OPENFGA_STORE_NAME="openobserve"                    # Store name
```


## Authentication Flow (Dex + OpenFGA Enabled)

### Without claim parser (default)
When `O2_CUSTOM_CLAIM_PARSING_ENABLED=false`, OpenObserve processes SSO authentication using standard JWT claims parsing. 

??? "Step 1: SSO login and token exchange"

    - User redirects to Dex
    - Authenticates via OIDC or LDAP
    - Dex returns JWT with standard claims such as email, name, groups, etc. 

??? "Step 2: Claims Parsing"

    Behavior depends on the `O2_MAP_GROUP_TO_ROLE` configuration:

    - When `O2_MAP_GROUP_TO_ROLE=true` (Default): 

        - The system maps all groups as **custom roles** in the `O2_DEX_DEFAULT_ORG`. For example, `["engineering", "sales", "cn=admin,ou=it"]`- here, all are treated as custom role names.  
        - The system assigns user to a single organization (the `default` org) with multiple custom roles. For example, user in `default` organization with roles: `engineering`, `sales`, `cn=admin,ou=it`
        - The system does not create multiple organizations. It only creates the roles within the `default` organization. 

    - When `O2_MAP_GROUP_TO_ROLE=false`:

        - The system parses each group to extract organization and role information.
        - If the group name contains an `=` sign (LDAP format): 

            - For example, `cn=admin,ou=engineering,dc=company`
            - The system parses it to extract organization and role information 
            - `ou=engineering` > user belongs to organization `engineering` 
            - `cn=admin` > user has role `admin` in that organization
            
        - If the group name does NOT contain an `=` sign (simple format):

            - The system treats the entire group name as an organization name
            - For example, `["engineering", "sales"]` 
            - The system creates organizations `engineering` and `sales`
            - The system assigns the user to both organizations
            - The user gets the default role (`O2_DEX_DEFAULT_ROLE`) in each organization
        
        -  The system creates multiple organizations. One for each group in the JWT token.


??? "Step 3: Fallback handling"

    If no groups exist or the groups array is empty:
    
    - The system uses `O2_DEX_DEFAULT_ORG` and `O2_DEX_DEFAULT_ROLE`
    - The user is assigned to the default organization with the default role

??? "Step 4: User creation"

    The system creates or updates the user in the database with the determined organization assignments.

??? "Step 5: OpenFGA synchronization"

    The system creates authorization tuples in OpenFGA based on the mapping mode selected.

??? "Step 6: Authorization"

    All subsequent requests check OpenFGA for permissions to determine what the user can access.


### With claim parser (recommended for complex mappings)
When `O2_CUSTOM_CLAIM_PARSING_ENABLED=true`, OpenObserve uses VRL (Vector Remap Language) functions to provide flexible, programmable user-to-organization mapping.

??? "Step 1: SSO login and token exchange"

    - User authenticates via Dex
    - JWT token is received with claims

??? "Step 2: VRL execution"

    - The system loads the claim parser function from the `_meta` organization
    - The function name is retrieved from organization settings (default: `claim_parser`)
    - The system executes VRL with claims as input
    - **Execution timeout**: 100ms maximum

??? "Step 3: Parse result"

    VRL returns one of three possible outcomes:

    - **Success**: An array of `{org, role}` assignments
        - Example: `[{org: "acme", role: "admin"}, {org: "widgets", role: "viewer"}]`
    
    - **Deny**: `{deny: true, reason: "..."}`
        - Login is rejected with the specified reason
    
    - **Error**: Fallback behavior depends on `O2_CLAIM_PARSING_DENY_ON_FAILURE`
        - If `false`: Fallback to default organization configuration
        - If `true`: Deny login

??? "Step 4: Validation"

    If `O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG=true`:
    
    - The system filters assignments to only existing organizations
    - Assignments to non-existent organizations are skipped
    
    If `O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG=false`:
    
    - The system auto-creates organizations as needed

??? "Step 5: Role mapping"

    Behavior depends on `O2_MAP_GROUP_TO_ROLE`:

    - When `O2_MAP_GROUP_TO_ROLE=true` (typical with custom parsing):

        - VRL returns: `[{org: "acme", role: "admin"}]`
        - The system creates organization `acme`
        - The system creates custom role `acme/admin`
        - Result: Multiple organizations with custom roles per organization
    
    - When `O2_MAP_GROUP_TO_ROLE=false` (uncommon):

        - VRL returns: `[{org: "acme", role: "admin"}]`
        - The system creates organization `acme`
        - The system uses built-in role `admin`
        - No custom role creation in OpenFGA

??? "Step 6: Role creation in OpenFGA"

    - If `O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=false`:

        - The system auto-creates custom roles in OpenFGA
    
    - If `O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=true`:

        - The system skips role creation
        - Roles must exist manually
        - **Warning**: This can cause authorization failures

??? "Step 7: OpenFGA synchronization"

    The system updates authorization tuples for all organization and role assignments.
    
    Example tuples:
    ```
    user:alice@example.com admin org:acme
    user:alice@example.com viewer org:widgets
    ```

??? "Step 8: Error logging"

    All failures are published to the `_meta/errors` stream with details:
    
    - Error type: `compile_error`, `exec_error`, `timeout`, `parse_error`, `validation_error`
    - Full claims payload
    - Error message

## Authentication flow diagram
The following diagram provides a complete visual representation of how OpenObserve processes Single Sign On authentication with and without the custom claim parser. It shows each decision point, how claims are interpreted, how organizations and roles are assigned, and how the system synchronizes authorization data in OpenFGA. 

??? "Authentication flow diagram"

    ```
    ┌─────────────────────────────────────────────────────────────────────┐
    │                        SSO Login via Dex                             │
    │                     JWT Token with Claims                            │
    │                   (email, name, groups)                              │
    └────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
                ┌──────────────────────────────┐
                │ O2_CUSTOM_CLAIM_PARSING_     │
                │      ENABLED = true?         │
                └──────────┬───────────────────┘
                            │
            ┌────────────────┴────────────────┐
            │ YES                             │ NO
            ▼                                 ▼
    ┌───────────────────┐           ┌─────────────────────┐
    │  Load VRL         │           │  groups array       │
    │  Function from    │           │  empty?             │
    │  _meta org        │           └──────┬──────────────┘
    └────────┬──────────┘                  │
            │                    ┌─────YES─┴──NO──────┐
            ▼                    │                     │
    ┌───────────────────┐         ▼                     ▼
    │ Execute VRL       │  ┌──────────────┐    ┌───────────────────┐
    │ (100ms timeout)   │  │ Use DEFAULT  │    │ O2_MAP_GROUP_     │
    └────────┬──────────┘  │ ORG + ROLE   │    │ TO_ROLE = true?   │
            │             └──────────────┘    └────┬──────────────┘
            ▼                                      │
    ┌───────────────────┐              ┌───────YES─┴──NO──────┐
    │ VRL Result?       │              │                       │
    └────┬──────────────┘              ▼                       ▼
        │             ┌────────────────────────┐   ┌──────────────────┐
        │             │ All groups > Custom    │   │ Parse each group │
        │             │ Roles in DEFAULT_ORG   │   │ to extract org   │
        │             │                        │   └────────┬─────────┘
        │             │ Example:               │            │
    ┌───┴──DENY───┐   │ groups: ["eng",       │            ▼
    │   SUCCESS    │   │         "sales"]      │   ┌────────────────┐
    │   ERROR      │   │ Result: User in       │   │ Group contains │
    └───┬──────────┘   │ "default" org with    │   │ "=" ?          │
        │              │ roles: "eng", "sales" │   └────┬───────────┘
        │              │                        │        │
        ▼              │ SINGLE ORG             │  ┌─YES─┴─NO──┐
    ┌──────────┐        │ MULTIPLE CUSTOM ROLES  │  │           │
    │ DENY?    │        └────────────────────────┘  ▼           ▼
    └────┬─────┘                                 ┌─────┐    ┌─────┐
        │                                       │LDAP │    │Use  │
    ┌──┴──NO──┐                               │DN   │    │group│
    │         │                                │Parse│    │as   │
    YES       ▼                                └──┬──┘    │org  │
    │   ┌──────────┐                              │       │name │
    │   │ SUCCESS? │                              │       └──┬──┘
    │   └────┬─────┘                              │          │
    │        │                                    │          │
    │   ┌YES─┴─NO (ERROR)─┐                      └────┬─────┘
    │   │                  │                           │
    │   ▼                  ▼                           ▼
    │ ┌────────┐  ┌────────────────┐         ┌─────────────────┐
    │ │Parse   │  │O2_CLAIM_       │         │Extract:         │
    │ │org/role│  │PARSING_DENY_   │         │ ou > org name   │
    │ │list    │  │ON_FAILURE?     │         │ cn > role name  │
    │ └───┬────┘  └────┬───────────┘         │ Create org per  │
    │     │            │                      │ group           │
    │     │      ┌─YES─┴─NO──┐               │                 │
    │     │      │           │               │ MULTIPLE ORGS   │
    │     │      ▼           ▼               │ BUILT-IN ROLES  │
    │     │   ┌──────┐  ┌────────┐          └─────────────────┘
    │     │   │DENY  │  │Use     │
    │     │   │LOGIN │  │DEFAULT │
    │     │   └──────┘  │ORG+    │
    │     │             │ROLE    │
    │     │             └────────┘
    │     ▼
    │  ┌────────────────────────┐
    │  │ O2_CLAIM_PARSING_      │
    │  │ REQUIRE_EXISTING_ORG?  │
    │  └──────┬─────────────────┘
    │         │
    │    ┌YES─┴─NO──┐
    │    │          │
    │    ▼          ▼
    │  ┌──────┐  ┌──────────┐
    │  │Filter│  │Auto-     │
    │  │to    │  │create    │
    │  │exist │  │orgs      │
    │  │orgs  │  └────┬─────┘
    │  └───┬──┘       │
    │      └──────┬───┘
    │             │
    │             ▼
    │   ┌──────────────────┐
    │   │ O2_MAP_GROUP_    │
    │   │ TO_ROLE = true?  │
    │   └────┬─────────────┘
    │        │
    │   ┌YES─┴─NO──┐
    │   │          │
    │   ▼          ▼
    │ ┌─────┐  ┌──────────┐
    │ │Org/ │  │Orgs with │
    │ │Role │  │built-in  │
    │ │>    │  │roles     │
    │ │Cust │  └──────────┘
    │ │om   │
    │ │Role │
    │ │per  │
    │ │org  │
    │ └──┬──┘
    │    │
    └────┴──────────┐
                    │
                    ▼
            ┌────────────────┐
            │ Create/Update  │
            │ User in DB     │
            └────────┬───────┘
                    │
                    ▼
            ┌────────────────┐
            │ Sync OpenFGA   │
            │ Tuples         │
            └────────┬───────┘
                    │
                    ▼
            ┌────────────────┐
            │ Login Success  │
            └────────────────┘
    ```



## Custom claim parser setup
This section explains how to set up custom claim parsing using VRL (Vector Remap Language) functions for complex authentication scenarios.

??? "Step 1: Enable custom parsing"
    ### Step 1: Enable custom parsing

    Set the following environment variables:
    ```bash
    O2_CUSTOM_CLAIM_PARSING_ENABLED=true
    O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG=false  # Auto-create organizations
    O2_CLAIM_PARSING_DENY_ON_FAILURE=false       # Fallback on error
    O2_MAP_GROUP_TO_ROLE=true                     # Map to custom roles (REQUIRED)
    O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=false     # Auto-create roles in OpenFGA
    ```

    !!! warning "Important configuration warnings"
        
        When `O2_CUSTOM_CLAIM_PARSING_ENABLED=true`, the system validates related configurations at startup:
        
        - **Warning 1**: If `O2_MAP_GROUP_TO_ROLE=false`, custom claim parsing may not work as expected
        - **Warning 2**: If `O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=true`, custom roles will NOT be auto-created in OpenFGA
        - **Recommendation**: Always use `O2_MAP_GROUP_TO_ROLE=true` with custom claim parsing

??? "Step 2: Create VRL function in `_meta` organization"
    ### Step 2: Create VRL function in `_meta` organization

    Store your VRL function via API at: `POST /api/_meta/functions/{function_name}`

    **Example VRL function**:
    ```vrl
    # Input: JWT claims object
    # Output: Array of {org, role} or {deny, reason}

    .assignments = []

    # Parse groups claim (For example, ["eng-admin", "sales-viewer"])
    if exists(.groups) {
        for_each(array!(.groups)) -> |_index, group| {
            parts = split(string!(group), "-")
            if length(parts) == 2 {
                .assignments = push(.assignments, {
                    "org": parts[0],
                    "role": parts[1]
                })
            }
        }
    }

    # Check for minimum access
    if length(.assignments) > 0 {
        .assignments
    } else {
        {"deny": true, "reason": "No valid group assignments"}
    }
    ```

    This example VRL function:

    - Expects groups in the format: `{organization}-{role}` (For example, `eng-admin`, `sales-viewer`)
    - Splits each group on the `-` character
    - Creates an assignment for each valid group
    - Denies login if no valid assignments are found

??? "Step 3: Configure organization settings (optional)"
    ### Step 3: Configure organization settings (optional)

    If you want to use a custom function name instead of the default `claim_parser`, update the organization settings:

    API endpoint: `POST /api/{org_id}/settings`
    ```json
    {
    "claim_parser_function": "custom_claim_parser"
    }
    ```

## Role mapping behavior
Understanding how `O2_MAP_GROUP_TO_ROLE` affects organization and role creation is critical for proper SSO configuration.

??? "When O2_MAP_GROUP_TO_ROLE=true (default)"
    ### When O2_MAP_GROUP_TO_ROLE=true (default)

    **Without custom claim parser:**

    - All groups are mapped as **custom roles** in `O2_DEX_DEFAULT_ORG` only
    - **Example**: `groups: ["eng", "sales"]`
    - **Result**: User in "default" organization with custom roles "eng" and "sales"
    - **Organizations created**: 1 (default only)
    - **Outcome**: Single organization, multiple custom roles

    **With custom claim parser:**

    - VRL returns organization assignments > Creates **multiple organizations** with custom roles per organization
    - **Example VRL output**: `[{org: "acme", role: "admin"}, {org: "widgets", role: "viewer"}]`
    - **Organizations created**: "acme", "widgets"
    - **Custom roles created**: "acme/admin", "widgets/viewer"
    - **OpenFGA tuples**:
    ```
    user:alice@example.com admin org:acme
    user:alice@example.com viewer org:widgets
    ```
    - **Outcome**: Multiple organizations with custom roles per organization

??? "When O2_MAP_GROUP_TO_ROLE=false"
    ### When O2_MAP_GROUP_TO_ROLE=false

    **Without custom claim parser:**

    - Groups are parsed to extract organization names > Creates **multiple organizations**
    - **LDAP DN format**: `cn=admin,ou=engineering` > organization "engineering" with built-in role "admin"
    - **Simple group**: `"engineering"` > organization "engineering" with `O2_DEX_DEFAULT_ROLE`
    - **Outcome**: Multiple organizations, built-in roles

    **With custom claim parser:**

    - VRL returns organization assignments > Creates multiple organizations with **built-in roles**
    - **Example VRL output**: `[{org: "acme", role: "admin"}]`
    - **Result**: Organization "acme" with built-in role "admin"
    - No custom role creation in OpenFGA
    - **Note**: This mode is uncommon with custom claim parser

## Configuration decision guide
Understanding these configuration choices helps you set up SSO correctly:

??? "Custom claim parsing"
    ### Custom claim parsing
    - **Enabled** (`O2_CUSTOM_CLAIM_PARSING_ENABLED=true`): Uses VRL function to parse claims
    - **Disabled** (`O2_CUSTOM_CLAIM_PARSING_ENABLED=false`): Uses standard group parsing logic

??? "Organization and role mapping"
    ### Organization and role mapping (`O2_MAP_GROUP_TO_ROLE`)

    **Without custom claim parser:**

    - `O2_MAP_GROUP_TO_ROLE=true`: Creates a single organization with multiple custom roles
    - `O2_MAP_GROUP_TO_ROLE=false`: Creates multiple organizations (one per group)

    **With custom claim parser:**

    - `O2_MAP_GROUP_TO_ROLE=true`: Creates multiple organizations with custom roles per organization (recommended)
    - `O2_MAP_GROUP_TO_ROLE=false`: Creates multiple organizations with built-in roles

??? "Group format detection"
    ### Group format detection
    - **Contains `=` character**: Treated as LDAP DN format (For example, `cn=admin,ou=engineering`)
    - **No `=` character**: Treated as simple organization name (For example, `engineering`)

??? "Error handling"
    ### Error handling (`O2_CLAIM_PARSING_DENY_ON_FAILURE`)
    - `true`: Reject login if VRL parsing fails
    - `false`: Fall back to default organization and role if VRL parsing fails

??? "Organization validation"
    ### Organization validation (`O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG`)
    - `true`: Only assign users to organizations that already exist in OpenObserve
    - `false`: Automatically create new organizations as needed

??? "Role creation in OpenFGA"
    ### Role creation in OpenFGA (`O2_MAP_GROUP_TO_ROLE_SKIP_CREATION`)
    - `false`: Automatically create custom roles in OpenFGA (recommended with custom claim parsing)
    - `true`: Do not create roles automatically - roles must be created manually

    !!! warning "Important"
        When using custom claim parsing, set `O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=false` to automatically create roles. If set to `true`, users will be assigned to roles that do not exist, causing authorization failures.



## Configuration scenarios

These scenarios demonstrate common SSO configurations for different use cases.

??? "Scenario 1: Simple group-to-role mapping (most common)"
    ### Scenario 1: Simple group-to-role mapping (most common)

    **Use case**: OIDC provider returns groups, map all as custom roles in single organization
    ```bash
    O2_DEX_ENABLED=true
    O2_OPENFGA_ENABLED=true
    O2_MAP_GROUP_TO_ROLE=true               # Default - map groups as roles
    O2_DEX_DEFAULT_ORG="default"
    O2_DEX_GROUP_CLAIM="groups"
    ```

    **Input groups**: `["engineering", "admin", "sales"]`

    **Result**: User in "default" organization with custom roles: "engineering", "admin", "sales"

    **Organizations created**: 1 (default only)

??? "Scenario 2: LDAP multi-organization setup"
    ### Scenario 2: LDAP multi-organization setup

    **Use case**: LDAP DN groups, create separate organization per LDAP group
    ```bash
    O2_DEX_ENABLED=true
    O2_OPENFGA_ENABLED=true
    O2_MAP_GROUP_TO_ROLE=false              # Parse groups to extract organizations
    O2_DEX_LDAP_GROUP_ATTRIBUTE="ou"
    O2_DEX_LDAP_ROLE_ATTRIBUTE="cn"
    O2_DEX_DEFAULT_ROLE="user"
    ```

    **Input groups**: `["cn=admin,ou=engineering", "cn=viewer,ou=sales"]`

    **Result**: User in organizations "engineering" (admin role) and "sales" (viewer role)

    **Organizations created**: 2 (engineering, sales)

??? "Scenario 3: Custom claim parser with multi-organization access"
    ### Scenario 3: Custom claim parser with multi-organization access

    **Use case**: Complex claims requiring VRL parsing, multiple organizations with custom roles
    ```bash
    O2_DEX_ENABLED=true
    O2_OPENFGA_ENABLED=true
    O2_CUSTOM_CLAIM_PARSING_ENABLED=true
    O2_MAP_GROUP_TO_ROLE=true                    # Create custom roles per organization
    O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG=false
    O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=false     # Auto-create roles
    ```

    **VRL output**: `[{org: "acme", role: "admin"}, {org: "widgets", role: "viewer"}]`

    **Result**: User in organizations "acme" (custom role: acme/admin) and "widgets" (custom role: widgets/viewer)

    **Organizations created**: 2 (acme, widgets)

??? "Scenario 4: Strict enterprise setup"
    ### Scenario 4: Strict enterprise setup

    **Use case**: Pre-created organizations only, deny on parsing failure, SSO-only
    ```bash
    O2_DEX_ENABLED=true
    O2_OPENFGA_ENABLED=true
    O2_CUSTOM_CLAIM_PARSING_ENABLED=true
    O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG=true   # Only existing organizations
    O2_CLAIM_PARSING_DENY_ON_FAILURE=true        # Deny login on VRL failure
    O2_DEX_NATIVE_LOGIN_ENABLED=false            # SSO-only, no native login
    ```

    **Result**: 
    - Only assign users to organizations that already exist
    - Deny login if VRL parsing fails
    - No native login available (SSO-only)

## Environment variables reference
This table lists all environment variables that control SSO behavior with Dex and OpenFGA.

| Variable | Default | Description |
|----------|---------|-------------|
| `O2_DEX_ENABLED` | `false` | Enable SSO via Dex |
| `O2_OPENFGA_ENABLED` | `false` | Enable fine-grained authorization via OpenFGA |
| `O2_MAP_GROUP_TO_ROLE` | `true` | **CRITICAL**: `true` = custom roles in default organization (single organization); `false` = multiple organizations from groups. With custom parser: `true` = custom roles per organization; `false` = built-in roles |
| `O2_CUSTOM_CLAIM_PARSING_ENABLED` | `false` | Enables VRL-based claim parsing, overrides standard DN parsing. **Requires `O2_MAP_GROUP_TO_ROLE=true`** |
| `O2_MAP_GROUP_TO_ROLE_SKIP_CREATION` | `true` | Skip automatic role creation in OpenFGA. **Set to `false` with custom parsing** to auto-create roles |
| `O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG` | `false` | If `true`, skip assignments to non-existent organizations. If `false`, auto-create organizations |
| `O2_CLAIM_PARSING_DENY_ON_FAILURE` | `false` | If `true`, deny login on VRL error. If `false`, fallback to default organization |
| `O2_DEX_DEFAULT_ORG` | `"default"` | Organization for single-organization mode (when `O2_MAP_GROUP_TO_ROLE=true` without custom parser) |
| `O2_DEX_DEFAULT_ROLE` | `"user"` | Fallback role when no role found in claims |
| `O2_DEX_GROUP_CLAIM` | `"groups"` | JWT claim name containing group memberships |
| `O2_DEX_LDAP_GROUP_ATTRIBUTE` | `"ou"` | LDAP DN attribute for organization (used when `O2_MAP_GROUP_TO_ROLE=false`) |
| `O2_DEX_LDAP_ROLE_ATTRIBUTE` | `"cn"` | LDAP DN attribute for role (used when `O2_MAP_GROUP_TO_ROLE=false`) |
| `O2_DEX_NATIVE_LOGIN_ENABLED` | `true` | Allow native login alongside SSO |
| `O2_DEX_ROOT_ONLY_LOGIN` | `false` | Restrict native login to root user only |
| `O2_DEX_BASE_URL` | - | Dex server URL (For example, `http://127.0.0.1:5556/dex`) |
| `O2_DEX_CLIENT_ID` | - | OAuth2 client ID |
| `O2_DEX_CLIENT_SECRET` | - | OAuth2 client secret |
| `O2_DEX_REDIRECT_URL` | - | OAuth2 callback URL (For example, `http://localhost:5080/callback`) |
| `O2_DEX_SCOPES` | `"openid profile email groups"` | OAuth2 scopes to request |
| `O2_OPENFGA_BASE_URL` | - | OpenFGA server URL (For example, `http://127.0.0.1:8080/stores`) |
| `O2_OPENFGA_STORE_NAME` | `"openobserve"` | OpenFGA store name |
| `O2_OPENFGA_OFFLINE_ACCESS_ROLES` | `"admin,editor,root"` | Roles allowed to create service tokens |
| `O2_OPENFGA_LIST_ONLY_PERMITTED` | `false` | If `true`, filter lists to only show permitted resources |


## Error handling and observability
When custom claim parsing is enabled, all errors are logged to the `_meta/errors` stream for troubleshooting.

???? "Error log structure"
    ### Error log structure
    ```json
    {
    "_timestamp": 1734643200000000,
    "error_source": "claim_parser",
    "pipeline_name": "sso_claim_parser",
    "error_type": "exec_error",
    "error": "VRL execution failed: undefined variable 'groups'",
    "claims": "{\"email\":\"user@example.com\",\"name\":\"John Doe\",...}"
    }
    ```

??? "Error types"
    ### Error types

    | Error Type | Description |
    |------------|-------------|
    | `compile_error` | VRL function failed to compile |
    | `exec_error` | VRL function execution failed |
    | `timeout` | VRL function exceeded 100ms timeout |
    | `parse_error` | Failed to parse VRL function output |
    | `validation_error` | VRL output failed validation checks |

??? "Accessing error logs"
    ### Accessing error logs

    Query the `_meta/errors` stream to view claim parsing errors:
    ```sql
    SELECT * FROM _meta_errors 
    WHERE error_source = 'claim_parser' 
    ORDER BY _timestamp DESC 
    LIMIT 100
    ```

## Native login behavior
When SSO is enabled, you can control whether users can also log in using native OpenObserve credentials.

??? "Configuration options"
    ### Configuration options

    **Both SSO and native login available:**
    ```bash
    O2_DEX_NATIVE_LOGIN_ENABLED=true
    ```
    Users can choose between SSO or native login on the login page.

    **Only root user can use native login:**
    ```bash
    O2_DEX_NATIVE_LOGIN_ENABLED=true
    O2_DEX_ROOT_ONLY_LOGIN=true
    ```
    All users except root must use SSO. Root user can use either SSO or native login.

    **SSO-only (no native login):**
    ```bash
    O2_DEX_NATIVE_LOGIN_ENABLED=false
    ```
    All users must use SSO. Native login is completely disabled.

## Configuration validation
OpenObserve performs validation checks at startup when custom claim parsing is enabled to prevent common configuration errors.

??? "Validation checks"
    ### Validation checks

    **Check 1: O2_MAP_GROUP_TO_ROLE requirement**

    If `O2_CUSTOM_CLAIM_PARSING_ENABLED=true` but `O2_MAP_GROUP_TO_ROLE=false`, you will see:
    ```
    WARNING: O2_CUSTOM_CLAIM_PARSING_ENABLED=true but O2_MAP_GROUP_TO_ROLE=false.
    Custom claim parsing may not work as expected.
    Set O2_MAP_GROUP_TO_ROLE=true to enable custom role mapping.
    ```

    **Why this matters:**

    - Custom claim parsing is designed to work with `O2_MAP_GROUP_TO_ROLE=true`
    - With `false`, you lose the ability to create custom roles per organization

    **Check 2: O2_MAP_GROUP_TO_ROLE_SKIP_CREATION warning**

    If `O2_CUSTOM_CLAIM_PARSING_ENABLED=true` but `O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=true`, you will see:
    ```
    WARNING: O2_CUSTOM_CLAIM_PARSING_ENABLED=true but O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=true.
    Custom roles will not be auto-created in OpenFGA.
    Set O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=false to enable auto-creation.
    ```

    **Why this matters:**

    - If `SKIP_CREATION=true`, custom roles must be manually created in OpenFGA
    - Users will be assigned to roles that don't exist, causing authorization failures

??? "Best practice configuration"
    ### Best practice configuration

    For custom claim parsing, use this recommended configuration:
    ```bash
    # For custom claim parsing (recommended)
    O2_CUSTOM_CLAIM_PARSING_ENABLED=true
    O2_MAP_GROUP_TO_ROLE=true                    # REQUIRED
    O2_MAP_GROUP_TO_ROLE_SKIP_CREATION=false     # Allow auto-creation
    O2_CLAIM_PARSING_REQUIRE_EXISTING_ORG=false  # Auto-create organizations (or true for strict mode)
    O2_CLAIM_PARSING_DENY_ON_FAILURE=false       # Fallback on error (or true for strict mode)
    ```

## Source code references

For developers who need to understand the implementation details:

| Component | File Path |
|-----------|-----------|
| JWT Processing | `src/handler/http/auth/jwt.rs` (lines 57-1115) |
| Claim Parser | `o2_enterprise/src/enterprise/auth/claim_parser.rs` |
| VRL Executor | `o2_enterprise/src/enterprise/auth/vrl_executor.rs` |
| Dex Configuration | `o2_dex/src/config.rs` |
| OpenFGA Configuration | `o2_openfga/src/config.rs` (validation: lines 113-145) |