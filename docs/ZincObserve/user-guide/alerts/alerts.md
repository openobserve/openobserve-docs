# Alerts

We support two kinds of alerts , which are evaluated for specified stream :

1. Scheduled alerts
1. Real time alerts

To navigate to alerts in ZincObserve , select preferred organization using organization selection control, then click on ![Alerts](../../images/alert_menu.jpg) menu , which will take one to alerts list screen. The screen lists all alerts for selected organization.  


<kbd>
![Alerts](../../images/alerts_list.jpg)
</kbd>

Alert screen details :


1. Search in listed alerts
1. Add new alert
1. Name of the alert - used during notification
1. Stream name for alert
1. Query used during alert evaluation - applicable only to scheduled alerts
1. Condition being evaluated for alert 
1. Edit alert
1. Delete alert


## Scheduled alerts
Scheduled alerts are evaluated at frequency for the condition of the alert , over duration specified as part of alert. If the condition evaluates to true a notification is sent to alert destination. Additionally user can delay notification after a notification is generated once for specified delay.

For eg : A user wants to be notified of condition if error code 500 occurs more than 15 time for duration of 2 mins & wants such evaluation to happen at 1 min frequency.

For above mentioned eg:
query : SELECT count("code") as occurrence FROM "default" WHERE code=500
condition : occurrence >= 15
duration : 2 mins - signifies data scanned by query is of last 2 mins
frequency : 1 mins

In case of scheduled alert user can specify sql which will be evaluated over duration at frequency specified by user.

<kbd>
![Scheduled Alert](../../images/scheduled_alert.jpg)
</kbd>


## Real time alerts
Real time alerts are evaluated at ingestion time based on condition specified , they are evaluated per record.

For eg :A user wants to be notified of when API response time is more than 100 ms

<kbd>
![Real Time Alert](../../images/real_time_alert.jpg)
</kbd>

Please note we only support slack webhook as destination for both kind of alerts.



