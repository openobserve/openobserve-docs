
### Where to Find This Feature
The **Comparison Against** feature is available for the following chart types in **Dashboards**:

- Area  
- Area Stacked  
- Bar  
- Horizontal Bar  
- Line  
- Scatter  
- Stacked  
- Horizontal Stacked

### How it Works?
In **Compare Against**, you write your SQL query and select the time range (such as 15 minutes) you want to analyze for the current data.
Then, you select one or more past points in time (such as 1 day) to run the same query for the same time range. OpenObserve runs the query twice and shows both results on the selected chart, so you can easily compare changes between current and past data.

If you select the time range of 15 minutes, OpenObserve runs:

- Your query for the selected time range at the current time (e.g., 3:00 PM → 3:15 PM).
- The same query for the same time range at the past time you selected (e.g., 1 day ago -> yesterday, 3:00 PM → 3:15 PM).


#### To access the feature

1. Go to **Dashboards** > **New Dashboard**.  
   ![dashboards](../../images/dashboards-comparison-against-1.png)  
2. Click **Add Panel.**  
   ![add panel](../../images/dashboards-comparison-against-2.png)
3. Select a chart [where the **Comparison Against** feature is available](#where-to-find-this-feature).  
   ![chart selection](../../images/dashboards-comparison-against-3.png)  
4. Under **Fields**, add **Stream Type** and **Stream**. These define the data source for your SQL query. Select fields that you want to set as x-axis (for example, timestamp) and y-axis (for example, error) of the chart.<br>
   ![stream selection](../../images/dashboards-comparison-against-4.png) 
   <br>**Note**: You may use the Query editor to further customize your query. 
   ![query editor](../../images/dashboards-comparison-against-5.png)  
5. Choose a time range. For instance, **Past 15 Minutes**. This becomes the period, the time range the system will use for both your current data and comparison data. 
   ![time range selection](../../images/dashboards-comparison-against-6.png)
6. Open the **Config** menu and scroll to **Comparison Against**.<br> 
   ![config menu](../../images/dashboards-comparison-against-7.png) 
7. By default, **0 Minutes ago** is selected. This represents your current data time.
8. Click **+ Add** to choose one or more past times to compare against the current time. For example, **1 day ago**. Use the dropdown menu to select the desired time. The system runs your SQL query for the same time range (period) at this past point.  
   ![add past time](../../images/dashboards-comparison-against-8.png)  
9. (Optional) Select a **Color Palette** to differentiate charts.  
10. Click **Apply** to run the query and update the chart.   
    **Note**: You must click **Apply** after adding or changing any comparison values.

**Result:**  
![result of comparison against](../../images/dashboards-comparison-against-9.png)

