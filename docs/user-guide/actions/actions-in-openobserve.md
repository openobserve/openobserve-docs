This guide explains what Actions are, their types, and use cases.

## What are Actions  
**Actions** in OpenObserve are user-defined Python scripts that support custom automation workflows. They can be applied to log data directly from the Logs UI or used as alert destinations. 

- Previously, OpenObserve supported log transformations only through VRL (Vector Remap Language). Python scripts written for Actions expand the capabilities of log transformations in OpenObserve.  
- Additionally, earlier, when an alert gets triggered, users used to get notified via email or webhook. But, with Actions as alert destinations, users can take an immediate action by adding an automation workflow using Actions. 

## Types of Actions  
OpenObserve supports two types of Actions:

- Real-time Actions  
- Scheduled Actions

## Real-time Actions  
Real-time Actions are executed immediately when applied.   
They support two usage scenarios:

- Manual execution during log exploration (via the Logs UI).  
- Automatic execution when an alert is triggered.

These actions are suitable for tasks that require immediate execution based on system activity or user interaction.

## Scheduled Actions  
Scheduled Actions run automatically based on a user-defined time interval or cron expression.  
These are ideal for recurring tasks such as:

- Periodic log analysis or cleanup  
- Scheduled integrations or reporting

## Next Steps

- [Create and Use Real-time Actions](create-and-use-real-time-actions.md)  

## Related Links

- [Declare Python Dependencies in Actions](declare-python-dependencies-in-O2-actions.md)
- [Environment Variables in Actions](environment-variables-in-actions.md)
