(function () {
  const integrations = [
    {
      id: "kubernetes",
      name: "Kubernetes",
      description: "Monitor Kubernetes clusters and workloads",
      category: "cloud",
      icon: "/docs/assets/popular-integration/kubernets.svg",
      configureUrl: "/docs/integration/k8s/",
      learnMoreUrl: "/docs/integration/k8s/",
    },
    {
      id: "mcp",
      name: "Model Context Protocol (MCP)",
      description: "Monitor Model Context Protocol integrations",
      category: "cloud",
      icon: "/docs/assets/popular-integration/mcp.svg",
      configureUrl: "/docs/integration/mcp",
      learnMoreUrl: "/docs/integration/mcp",
    },
    {
      id: "cloudflare",
      name: "Cloudflare",
      description: "Monitor Cloudflare logs and events",
      category: "cloud",
      icon: "/docs/assets/popular-integration/cloudflare.svg",
      configureUrl: "/docs/integration/cloudflare/",
      learnMoreUrl: "/docs/integration/cloudflare/",
    },
    {
      id: "gcp-logs",
      name: "GCP Logs",
      description: "Ingest and analyze Google Cloud logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/gcp-logs.svg",
      configureUrl: "/docs/integration/gcp/gcp-logs/",
      learnMoreUrl: "/docs/integration/gcp/gcp-logs/",
    },
    {
      id: "cloud-run",
      name: "Google Cloud Run",
      description: "Monitor Google Cloud Run services",
      category: "cloud",
      icon: "/docs/assets/popular-integration/gcp.svg",
      configureUrl: "/docs/integration/gcp/cloud-run/",
      learnMoreUrl: "/docs/integration/gcp/cloud-run/",
    },
    {
      id: "linux",
      name: "Linux",
      description: "Collect and monitor Linux system metrics and logs",
      category: "os",
      icon: "/docs/assets/popular-integration/linux.svg",
      configureUrl: "/docs/integration/linux/",
      learnMoreUrl: "/docs/integration/linux/",
    },
    {
      id: "windows",
      name: "Windows",
      description: "Collect and monitor Windows system metrics and logs",
      category: "os",
      icon: "/docs/assets/popular-integration/windows.svg",
      configureUrl: "/docs/integration/windows/",
      learnMoreUrl: "/docs/integration/windows/",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Monitor Vercel deployments and serverless functions",
      category: "cloud",
      icon: "/docs/assets/popular-integration/vercel.svg",
      configureUrl: "/docs/integration/vercel/",
      learnMoreUrl: "/docs/integration/vercel/",
    },
    {
      id: "heroku",
      name: "Heroku",
      description: "Monitor Heroku apps and logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/heroku.svg",
      configureUrl: "/docs/integration/heroku/",
      learnMoreUrl: "/docs/integration/heroku/",
    },
    {
      id: "message-brokers",
      name: "Message Brokers",
      description: "Monitor message broker systems",
      category: "messaging",
      icon: "/docs/assets/popular-integration/message-brokers.svg",
      configureUrl: "/docs/integration/message-brokers",
      learnMoreUrl: "/docs/integration/message-brokers",
    },
    {
      id: "ec2",
      name: "Amazon EC2",
      description: "Monitor Amazon EC2 instances",
      category: "cloud",
      icon: "/docs/assets/popular-integration/ec2.svg",
      configureUrl: "/docs/integration/aws/ec2/",
      learnMoreUrl: "/docs/integration/aws/ec2/",
    },
    {
      id: "alb",
      name: "Application Load Balancer (ALB)",
      description: "Monitor AWS Application Load Balancers",
      category: "cloud",
      icon: "/docs/assets/popular-integration/load-balancer.svg",
      configureUrl: "/docs/integration/aws/alb/",
      learnMoreUrl: "/docs/integration/aws/alb/",
    },
    {
      id: "vpc-flow",
      name: "Amazon Virtual Private Cloud",
      description: "Analyze Amazon VPC flow logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/vpc-flow.svg",
      configureUrl: "/docs/integration/aws/vpc-flow/",
      learnMoreUrl: "/docs/integration/aws/vpc-flow/",
    },
    {
      id: "cognito",
      name: "Amazon Cognito",
      description: "Monitor Amazon Cognito authentication logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/cognito.svg",
      configureUrl: "/docs/integration/aws/cognito/",
      learnMoreUrl: "/docs/integration/aws/cognito/",
    },
    {
      id: "network-firewall",
      name: "AWS Network Firewall",
      description: "Monitor AWS Network Firewall events",
      category: "cloud",
      icon: "/docs/assets/popular-integration/network-firewall.svg",
      configureUrl: "/docs/integration/aws/network-firewall/",
      learnMoreUrl: "/docs/integration/aws/network-firewall/",
    },
    {
      id: "cloudwatch-logs",
      name: "AWS CloudWatch Logs",
      description: "Ingest AWS CloudWatch logs",
      category: "cloud",
      icon: "/docs/assets/user-guides/Log Search.svg",
      configureUrl: "/docs/integration/aws/cloudwatch-logs/",
      learnMoreUrl: "/docs/integration/aws/cloudwatch-logs/",
    },
    {
      id: "cloudwatch-metrics",
      name: "AWS CloudWatch Metrics",
      description: "Collect AWS CloudWatch metrics",
      category: "cloud",
      icon: "/docs/assets/user-guides/status-up.svg",
      configureUrl: "/docs/integration/aws/cloudwatch-metrics/",
      learnMoreUrl: "/docs/integration/aws/cloudwatch-metrics/",
    },
    {
      id: "rds",
      name: "Amazon RDS",
      description: "Monitor Amazon RDS databases",
      category: "database",
      icon: "/docs/assets/popular-integration/rds.svg",
      configureUrl: "/docs/integration/aws/rds/",
      learnMoreUrl: "/docs/integration/aws/rds/",
    },
    {
      id: "ecs",
      name: "Amazon ECS",
      description: "Monitor Amazon ECS containers",
      category: "cloud",
      icon: "/docs/assets/popular-integration/ecs.svg",
      configureUrl: "/docs/integration/aws/ecs/",
      learnMoreUrl: "/docs/integration/aws/ecs/",
    },
    {
      id: "route-53",
      name: "AWS Route 53",
      description: "Monitor Route 53 DNS logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/route-53.svg",
      configureUrl: "/docs/integration/aws/route-53/",
      learnMoreUrl: "/docs/integration/aws/route-53/",
    },
    {
      id: "waf",
      name: "AWS WAF",
      description: "Monitor AWS Web Application Firewall",
      category: "cloud",
      icon: "/docs/assets/popular-integration/waf.svg",
      configureUrl: "/docs/integration/aws/waf/",
      learnMoreUrl: "/docs/integration/aws/waf/",
    },
    {
      id: "api-gateway",
      name: "API Gateway",
      description: "Monitor AWS API Gateway logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/api-gateway.svg",
      configureUrl: "/docs/integration/aws/api-gateway/",
      learnMoreUrl: "/docs/integration/aws/api-gateway/",
    },
    {
      id: "cloudfront",
      name: "Amazon CloudFront",
      description: "Monitor CloudFront CDN logs",
      category: "cloud",
      icon: "/docs/assets/popular-integration/cloudfront.svg",
      configureUrl: "/docs/integration/aws/cdn/",
      learnMoreUrl: "/docs/integration/aws/cdn/",
    },
    {
      id: "eventbridge",
      name: "Amazon EventBridge",
      description: "Monitor EventBridge events",
      category: "cloud",
      icon: "/docs/assets/popular-integration/eventbridge.svg",
      configureUrl: "/docs/integration/aws/eventbridge/",
      learnMoreUrl: "/docs/integration/aws/eventbridge/",
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      description: "Monitor PostgreSQL databases",
      category: "database",
      icon: "/docs/assets/popular-integration/postgresql.svg",
      configureUrl: "/docs/integration/database/postgresql/",
      learnMoreUrl: "/docs/integration/database/postgresql/",
    },
    {
      id: "snowflake",
      name: "Snowflake",
      description: "Monitor Snowflake data warehouse",
      category: "database",
      icon: "/docs/assets/popular-integration/snowflake.svg",
      configureUrl: "/docs/integration/database/snowflake/",
      learnMoreUrl: "/docs/integration/database/snowflake/",
    },
    {
      id: "oracle",
      name: "Oracle Database",
      description: "Monitor Oracle databases",
      category: "database",
      icon: "/docs/assets/popular-integration/oracle.svg",
      configureUrl: "/docs/integration/database/oracle/",
      learnMoreUrl: "/docs/integration/database/oracle/",
    },
    {
      id: "mysql",
      name: "MySQL",
      description: "Monitor MySQL databases",
      category: "database",
      icon: "/docs/assets/popular-integration/mysql.svg",
      configureUrl: "/docs/integration/database/mysql/",
      learnMoreUrl: "/docs/integration/database/mysql/",
    },
    {
      id: "mongodb",
      name: "MongoDB",
      description: "Monitor MongoDB databases",
      category: "database",
      icon: "/docs/assets/popular-integration/mongodb.svg",
      configureUrl: "/docs/integration/database/mongodb/",
      learnMoreUrl: "/docs/integration/database/mongodb/",
    },
    {
      id: "redis",
      name: "Redis",
      description: "Monitor Redis instances",
      category: "database",
      icon: "/docs/assets/popular-integration/redis.svg",
      configureUrl: "/docs/integration/database/redis/",
      learnMoreUrl: "/docs/integration/database/redis/",
    },
    {
      id: "dynamodb",
      name: "Amazon DynamoDB",
      description: "Monitor DynamoDB tables",
      category: "database",
      icon: "/docs/assets/popular-integration/dynamodb.svg",
      configureUrl: "/docs/integration/database/dynamodb/",
      learnMoreUrl: "/docs/integration/database/dynamodb/",
    },
    {
      id: "zookeeper",
      name: "Apache Zookeeper",
      description: "Monitor Apache Zookeeper clusters",
      category: "database",
      icon: "/docs/assets/popular-integration/zookeeper.svg",
      configureUrl: "/docs/integration/database/zookeeper/",
      learnMoreUrl: "/docs/integration/database/zookeeper/",
    },
    {
      id: "cassandra",
      name: "Cassandra",
      description: "Monitor Cassandra databases",
      category: "database",
      icon: "/docs/assets/popular-integration/cassandra.svg",
      configureUrl: "/docs/integration/database/cassandra/",
      learnMoreUrl: "/docs/integration/database/cassandra/",
    },
    {
      id: "aerospike",
      name: "Aerospike",
      description: "Monitor Aerospike databases",
      category: "database",
      icon: "/docs/assets/popular-integration/aerospike.svg",
      configureUrl: "/docs/integration/database/aerospike/",
      learnMoreUrl: "/docs/integration/database/aerospike/",
    },
    {
      id: "nginx",
      name: "Nginx",
      description: "Monitor Nginx server logs and metrics",
      category: "server",
      icon: "/docs/assets/popular-integration/nginx.svg",
      configureUrl: "/docs/integration/servers/nginx/",
      learnMoreUrl: "/docs/integration/servers/nginx/",
    },
    {
      id: "weblogic",
      name: "Oracle Weblogic",
      description: "Monitor Oracle Weblogic servers",
      category: "server",
      icon: "/docs/assets/popular-integration/weblogic.svg",
      configureUrl: "/docs/integration/servers/weblogic/",
      learnMoreUrl: "/docs/integration/servers/weblogic/",
    },
    {
      id: "jenkins",
      name: "Jenkins",
      description: "Monitor Jenkins pipelines and builds",
      category: "devops",
      icon: "/docs/assets/popular-integration/jenkins.svg",
      configureUrl: "/docs/integration/devops/jenkins/",
      learnMoreUrl: "/docs/integration/devops/jenkins/",
    },
    {
      id: "ansible",
      name: "Ansible",
      description: "Monitor Ansible automation runs",
      category: "devops",
      icon: "/docs/assets/popular-integration/ansible.svg",
      configureUrl: "/docs/integration/devops/ansible/",
      learnMoreUrl: "/docs/integration/devops/ansible/",
    },
    {
      id: "terraform",
      name: "Terraform",
      description: "Monitor Terraform deployments",
      category: "devops",
      icon: "/docs/assets/popular-integration/terraform.svg",
      configureUrl: "/docs/integration/devops/terraform/",
      learnMoreUrl: "/docs/integration/devops/terraform/",
    },
    {
      id: "github-actions",
      name: "Github Actions",
      description: "Monitor GitHub Actions workflows",
      category: "devops",
      icon: "/docs/assets/popular-integration/git.svg",
      configureUrl: "/docs/integration/devops/github-actions/",
      learnMoreUrl: "/docs/integration/devops/github-actions/",
    },
    {
      id: "kafka",
      name: "Kafka",
      description: "Monitor Kafka brokers and topics",
      category: "messaging",
      icon: "/docs/assets/popular-integration/kafka.svg",
      configureUrl: "/docs/integration/message-brokers/kafka/",
      learnMoreUrl: "/docs/integration/message-brokers/kafka/",
    },
    {
      id: "rabbitmq",
      name: "RabbitMQ",
      description: "Monitor RabbitMQ queues and exchanges",
      category: "messaging",
      icon: "/docs/assets/popular-integration/rabbitmq.svg",
      configureUrl: "/docs/integration/message-brokers/rabbitmq/",
      learnMoreUrl: "/docs/integration/message-brokers/rabbitmq/",
    },
    {
      id: "nats",
      name: "NATS",
      description: "Monitor NATS messaging systems",
      category: "messaging",
      icon: "/docs/assets/popular-integration/nats.svg",
      configureUrl: "/docs/integration/message-brokers/nats/",
      learnMoreUrl: "/docs/integration/message-brokers/nats/",
    },
  ];

  // Dynamically render filter tags from unique categories
  function renderFilterTags() {
    const grid = document.getElementById("integrations-container");
    if (!grid) return;

    let tagsContainer = document.getElementById("integrations-filters");
    if (!tagsContainer) {
      tagsContainer = document.createElement("div");
      tagsContainer.id = "integrations-filters";
      tagsContainer.className = "integration-filter-tags";
      grid.parentNode.insertBefore(tagsContainer, grid);
    }

    const categories = Array.from(new Set(integrations.map((i) => i.category)));

    const toLabel = (cat) => {
      if (cat === "os") return "OS";
      if (cat === "devops") return "DevOps";
      return cat.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    };

    tagsContainer.innerHTML = "";

    // 'All' button (default active)
    const allBtn = document.createElement("button");
    allBtn.className = "filter-tag active";
    allBtn.dataset.category = "all";
    allBtn.textContent = "All";
    tagsContainer.appendChild(allBtn);

    // Category buttons
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter-tag";
      btn.dataset.category = cat;
      btn.textContent = toLabel(cat);
      tagsContainer.appendChild(btn);
    });
  }

  function renderIntegrations(filterCategory = "all") {
    const container = document.getElementById("integrations-container");
    if (!container) return;

    container.innerHTML = "";

    const colorClasses = [
      "landing-integration-icon--green",
      "landing-integration-icon--blue",
      "landing-integration-icon--orange",
      "landing-integration-icon--purple",
      "landing-integration-icon--pink",
      "landing-integration-icon--navy",
      "landing-integration-icon--red",
      "landing-integration-icon--forest",
    ];

    const filtered =
      filterCategory === "all"
        ? integrations
        : integrations.filter((i) => i.category === filterCategory);

    filtered.forEach((integration, index) => {
      const card = document.createElement("div");
      card.className = "integrations-landing-card";

      /* ---------- CENTER BLOCK (icon + centered title) ---------- */
      const centerBlock = document.createElement("div");
      centerBlock.className = "integration-center";

      const iconWrapper = document.createElement("div");
      iconWrapper.className =
        "landing-integration-icon " + colorClasses[index % colorClasses.length];

      const img = document.createElement("img");
      img.src = integration.icon;
      img.alt = integration.name;

      iconWrapper.appendChild(img);

      const centerTitle = document.createElement("h3");
      centerTitle.className = "integration-title";
      centerTitle.textContent = integration.name;

      centerBlock.append(iconWrapper, centerTitle);

      /* ---------- HOVER CONTENT (title + description) ---------- */
      const textWrapper = document.createElement("div");
      textWrapper.className = "landing-integration-text";

      const hoverTitle = document.createElement("h3");
      hoverTitle.className = "integration-title integration-title--hover";
      hoverTitle.textContent = integration.name;

      const description = document.createElement("p");
      description.className = "integration-description";
      description.textContent = integration.description;

      textWrapper.append(hoverTitle, description);

      /* ---------- BUTTONS ---------- */
      const buttons = document.createElement("div");
      buttons.className = "landing-integration-buttons";

      buttons.innerHTML = `
      <a href="${integration.configureUrl}"
         class="landing-integration-btn landing-integration-btn-primary">
        Configure
      </a>
      <a href="${integration.learnMoreUrl}"
         class="landing-integration-btn landing-integration-btn-secondary">
        Learn More
      </a>
    `;

      /* ---------- ASSEMBLE ---------- */
      card.append(centerBlock, textWrapper, buttons);
      container.appendChild(card);
    });
  }

  function initializeFilters() {
    const tags = document.querySelectorAll(".filter-tag");
    if (!tags.length) return;

    tags.forEach((tag) => {
      tag.onclick = () => {
        tags.forEach((t) => t.classList.remove("active"));
        tag.classList.add("active");
        renderIntegrations(tag.dataset.category);
      };
    });
  }

  function init() {
    // Run ONLY on integrations page
    if (!document.getElementById("integrations-container")) return;

    renderFilterTags();
    renderIntegrations();
    initializeFilters();
  }

  // ✅ This fires on EVERY navigation
  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
