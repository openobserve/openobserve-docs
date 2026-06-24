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
    Each service represents an application component discovered from distributed traces. Services appear as either **instrumented** or **inferred**:

    - **Instrumented services** are your own applications that send traces to OpenObserve. They appear as solid nodes in the graph.
    - **Inferred dependencies** are downstream systems (databases, queues, external APIs, RPC backends) that your applications call but that do not send traces themselves. OpenObserve infers their existence from trace spans and renders them as dotted nodes with a type icon. For details, see [Inferred dependencies](#inferred-dependencies).

    For every service the view displays:

    - The service name  
    - A summary of recent requests  
    - A colour that reflects the recent error behaviour  

    ??? "Colours"
    ### Colours
    Colours indicate the health of each service.
    
    - Green shows healthy behaviour  
    - Yellow and orange show increased errors  
    - Red shows repeated failures  

    ??? "Edges"
    ### Edges
    Edges represent calls from one service to another. They indicate downstream communication and help you identify where issues may originate.

    Edges appear in two styles:

    - **Instrumented edges** connect two instrumented services. They are rendered as solid lines.
    - **Inferred edges** connect an instrumented service to an inferred dependency. They are rendered as dotted lines and display a connection type icon. For details, see [Inferred dependencies](#inferred-dependencies).

    ??? "Inferred dependencies"
    ### Inferred dependencies

    When your instrumented services communicate with systems that do not send traces — such as databases, message queues, external HTTP APIs, or RPC backends — OpenObserve detects these interactions from trace spans and surfaces them as **inferred dependencies** in the service graph.

    Inferred dependencies are visualised differently from instrumented services:

    - **Nodes** are shown as dotted outlines with a type icon that indicates the category.
    - **Edges** are shown as dotted lines, also marked with the connection type.

    ![TODO: screenshot of service graph with inferred dependency nodes and edges](images/placeholder.png)

    OpenObserve supports the following inferred dependency types:

    | Connection type | Description |
    |-----------------|-------------|
    | `database` | A database system such as PostgreSQL, Redis, or MongoDB |
    | `queue` | A message broker or queue such as Kafka, RabbitMQ, or NATS |
    | `rpc` | An RPC backend that is not sending its own traces |
    | `external` | An external HTTP or HTTPS API |

    Inferred dependencies are detected automatically. You do not need to configure anything — any trace span that references an uninstrumented downstream system is classified and displayed with the appropriate type. Instrumented services that send traces continue to appear as solid nodes; the inferred-dependency styling is applied only to systems that are not sending trace data themselves.

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