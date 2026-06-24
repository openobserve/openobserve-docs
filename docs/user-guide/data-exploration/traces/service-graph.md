=== "Overview"
    Service graph provides a real time visual overview of how your services communicate with each other. It reads distributed traces and identifies which services call downstream services, how many requests flow between them, and how healthy those interactions are.

    !!! note "Note" 
        Service Graph is an Enterprise-only feature.

    **Key points**:

    - It helps you understand system behaviour at a glance. 
    - It highlights unusual behaviour so that you can quickly decide where to investigate next using Logs, Metrics, or Traces. 
    - It is not intended for detailed debugging. 
    - It helps you see the overall topology and identify the services that need closer attention.

    Service graph focuses on recent activity. When services are inactive for a period of time, they are removed from the graph to prevent unbounded growth and to keep the view relevant.


    !!! note "Where to find this"

        1. Sign in to OpenObserve.
        2. Select **Traces** in the left navigation panel.
        3. The **Service graph** icon that appears at the top-left corner of the page.

        The topology loads automatically when recent trace activity is available.
        If there is no trace activity, the section displays a message indicating that no service graph data is available.


    ## What service graph displays
    Service graph displays the services in your system and the communication observed between them.

    ??? "Services"
    ### Services
    Each service represents an application component discovered from distributed traces. The view displays:

    - The service name  
    - A summary of recent requests  
    - A colour that reflects the recent error behaviour  

    Instrumented services appear as solid nodes. Inferred (uninstrumented) dependencies appear as dotted nodes with a type icon indicating the dependency category.

    ??? "Colours"
    ### Colours
    Colours indicate the health of each service.
    
    - Green shows healthy behaviour  
    - Yellow and orange show increased errors  
    - Red shows repeated failures  

    ??? "Edges"
    ### Edges
    Edges represent calls from one service to another. They indicate downstream communication and help you identify where issues may originate. Instrumented service-to-service edges appear as solid lines. Edges to inferred dependencies appear as dotted lines with a type icon.

    ??? "Inferred dependencies"
    ### Inferred dependencies
    OpenObserve can detect uninstrumented dependencies—services that participate in distributed traces but do not emit spans directly. These dependencies include databases, message queues, external APIs, and RPC backends.

    ![TODO: screenshot of service graph showing inferred dependency nodes with dotted borders and type icons](images/placeholder.png)

    Inferred dependencies appear in the service graph as dotted nodes with a type icon that indicates the dependency category:

    - **Database** — relational databases, key-value stores, and other data stores  
    - **Queue** — message queues and streaming platforms  
    - **RPC** — remote procedure call backends  
    - **External** — external third-party APIs and services  

    Instrumented services (those that emit spans directly) appear as solid nodes without a type icon. This visual distinction helps you quickly identify which parts of your system are directly observed and which are inferred from span relationships.

    The `_o2_service_graph` internal index stores a `connection_type` field on each edge record. For edges written by the inferred-services pipeline, this field carries the category. For instrumented edges, the field is absent. The service graph topology builder reads this field and propagates it to both the edge and the target node, so the UI renders the appropriate visual treatment.

    ??? "Topology behaviour"
    ### Topology behaviour
    Service graph displays only recent activity. When a service produces no trace data for a set duration, it is removed from the topology. This design focuses attention on the active state of your system.


    ## Data source
    Service graph uses distributed traces as the single data source.  
    OpenObserve matches client spans and server spans belonging to the same request. This allows the system to identify service relationships, request patterns, and error behaviour.

    Service graph does not use logs or metrics directly.

    ## Main controls
    
    ??? "Stream selector"
    ### Stream selector
    Select a trace stream to build the topology from. You can choose a single stream or combine all streams.
    
    ??? "Search services"
    ### Search services
    Enter a service name to filter the view. The graph focuses on the selected service and the services connected to it.

    ??? "Refresh controls"
    ### Refresh controls
    Use manual refresh or enable automatic refresh. Auto refresh supports intervals between five seconds and three hundred seconds.

    ??? "View mode" 
    ### View mode
    Choose between Tree view and Graph view. Both views show the same information using different layouts.

    ??? "Layout options"
    ### Layout options
    Tree view supports horizontal, vertical, and radial layouts.  
    Graph view supports force directed and circular layouts.

    ## Tree view
    Tree view arranges services in a structured hierarchy. It is useful when you want to follow traffic from entrypoint services to downstream dependencies.

    ## Graph view
    Graph view arranges services as a network. It uses a physics based simulation to maintain stable spacing between services. Force directed layouts group related services together. Circular layouts arrange services around a circle.

    ## Interaction
    You can drag services to reposition them. You can zoom and pan to explore specific areas. Hovering over a service displays a summary of request and error behaviour. Filters and layouts can be combined to focus on specific sections of the topology.

=== "How-to"
    ## Filter the graph by service

    1. Enter a service name in the **Search services** field.  
    4. Review the focused view of the selected service.

    ## Change the view type

    1. Select Tree view or Graph view.  
    4. Select a layout.

    ## Investigate an issue

    1. In the **Service graph**, identify any services with warning or error colours.  
    3. Follow the edges to determine which downstream services may be affected.  
    4. Note the service name.  
    5. Switch to Logs, Metrics, or Traces and filter by that service for further analysis.