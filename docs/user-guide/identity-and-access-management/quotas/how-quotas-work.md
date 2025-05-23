This guide explains how org-level and role-level quotas work in OpenObserve, and what happens when one or both types of quotas are applied. To learn how to configure quotas, see the [Quotas documentation](quotas.md).

In OpenObserve, quotas can be set at two levels:

- **Org-level**: This is the total request limit shared by all users in the organization.
- **Role-level**: This is the total request limit shared by all users assigned to a specific role within an organization.

### Scenario 1: Only Org-Level Limit Is Set

When you set a quota at the org level (for example, limiting the Alerts API to 100 requests per second), the limit applies collectively to all users in the organization.

**Example**  
If 10 users share a 100 requests-per-second limit, a single user can consume the full quota.  
If that happens, other users receives `RateLimitExceeded` errors.

### Scenario 2: Only Role-Level Limit Is Set

Role-level limits are shared across all users assigned to that role within an organization. They are not applied per user.

**Example**  
If the role limit is 50 requests per second and there are 5 users in the role, all five users share that 50 requests-per-second quota.  
If one user consumes the full quota, other users in the role receives `RateLimitExceeded` errors.

### Scenario 3: Both Org-Level and Role-Level Limits Are Set

When both limits are set:

- Users are first restricted by their role-level quota, which is shared among all users in the role.
- In addition, all users across all roles are collectively restricted by the org-level quota.

**Example**  
If the org-level limit is 100 requests per second and the role-level limit is 20 requests per second:

- Only 20 requests per second can be used collectively by users in that role.  
  If one user in the role consumes all 20 requests per second, others in the same role receives `RateLimitExceeded` errors.
- Across all roles, if the total usage exceeds the 100 requests-per-second org quota, further requests are blocked with `RateLimitExceeded` errors, even if individual role limits have not been reached.
