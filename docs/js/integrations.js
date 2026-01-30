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
      icon: "/docs/assets/popular-integration/kubernets.svg",
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
      icon: "/docs/assets/popular-integration/gcp.svg",
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
      icon: "",
      configureUrl: "/docs/integration/linux/",
      learnMoreUrl: "/docs/integration/linux/",
    },
    {
      id: "windows",
      name: "Windows",
      description: "Collect and monitor Windows system metrics and logs",
      category: "os",
      icon: "",
      configureUrl: "/docs/integration/windows/",
      learnMoreUrl: "/docs/integration/windows/",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Monitor Vercel deployments and serverless functions",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/vercel/",
      learnMoreUrl: "/docs/integration/vercel/",
    },
    {
      id: "heroku",
      name: "Heroku",
      description: "Monitor Heroku apps and logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/heroku/",
      learnMoreUrl: "/docs/integration/heroku/",
    },
    {
      id: "message-brokers",
      name: "Message Brokers",
      description: "Monitor message broker systems",
      category: "messaging",
      icon: "",
      configureUrl: "/docs/integration/message-brokers",
      learnMoreUrl: "/docs/integration/message-brokers",
    },
    {
      id: "ec2",
      name: "Amazon EC2",
      description: "Monitor Amazon EC2 instances",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/ec2/",
      learnMoreUrl: "/docs/integration/aws/ec2/",
    },
    {
      id: "alb",
      name: "Application Load Balancer (ALB)",
      description: "Monitor AWS Application Load Balancers",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/alb/",
      learnMoreUrl: "/docs/integration/aws/alb/",
    },
    {
      id: "vpc-flow",
      name: "Amazon Virtual Private Cloud",
      description: "Analyze Amazon VPC flow logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/vpc-flow/",
      learnMoreUrl: "/docs/integration/aws/vpc-flow/",
    },
    {
      id: "cognito",
      name: "Amazon Cognito",
      description: "Monitor Amazon Cognito authentication logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/cognito/",
      learnMoreUrl: "/docs/integration/aws/cognito/",
    },
    {
      id: "network-firewall",
      name: "AWS Network Firewall",
      description: "Monitor AWS Network Firewall events",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/network-firewall/",
      learnMoreUrl: "/docs/integration/aws/network-firewall/",
    },
    {
      id: "cloudwatch-logs",
      name: "AWS CloudWatch Logs",
      description: "Ingest AWS CloudWatch logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/cloudwatch-logs/",
      learnMoreUrl: "/docs/integration/aws/cloudwatch-logs/",
    },
    {
      id: "cloudwatch-metrics",
      name: "AWS CloudWatch Metrics",
      description: "Collect AWS CloudWatch metrics",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/cloudwatch-metrics/",
      learnMoreUrl: "/docs/integration/aws/cloudwatch-metrics/",
    },
    {
      id: "rds",
      name: "Amazon RDS",
      description: "Monitor Amazon RDS databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/aws/rds/",
      learnMoreUrl: "/docs/integration/aws/rds/",
    },
    {
      id: "ecs",
      name: "Amazon ECS",
      description: "Monitor Amazon ECS containers",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/ecs/",
      learnMoreUrl: "/docs/integration/aws/ecs/",
    },
    {
      id: "route-53",
      name: "AWS Route 53",
      description: "Monitor Route 53 DNS logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/route-53/",
      learnMoreUrl: "/docs/integration/aws/route-53/",
    },
    {
      id: "waf",
      name: "AWS WAF",
      description: "Monitor AWS Web Application Firewall",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/waf/",
      learnMoreUrl: "/docs/integration/aws/waf/",
    },
    {
      id: "api-gateway",
      name: "API Gateway",
      description: "Monitor AWS API Gateway logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/api-gateway/",
      learnMoreUrl: "/docs/integration/aws/api-gateway/",
    },
    {
      id: "cloudfront",
      name: "Amazon CloudFront",
      description: "Monitor CloudFront CDN logs",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/cdn/",
      learnMoreUrl: "/docs/integration/aws/cdn/",
    },
    {
      id: "eventbridge",
      name: "Amazon EventBridge",
      description: "Monitor EventBridge events",
      category: "cloud",
      icon: "",
      configureUrl: "/docs/integration/aws/eventbridge/",
      learnMoreUrl: "/docs/integration/aws/eventbridge/",
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      description: "Monitor PostgreSQL databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/postgresql/",
      learnMoreUrl: "/docs/integration/database/postgresql/",
    },
    {
      id: "snowflake",
      name: "Snowflake",
      description: "Monitor Snowflake data warehouse",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/snowflake/",
      learnMoreUrl: "/docs/integration/database/snowflake/",
    },
    {
      id: "oracle",
      name: "Oracle Database",
      description: "Monitor Oracle databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/oracle/",
      learnMoreUrl: "/docs/integration/database/oracle/",
    },
    {
      id: "mysql",
      name: "MySQL",
      description: "Monitor MySQL databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/mysql/",
      learnMoreUrl: "/docs/integration/database/mysql/",
    },
    {
      id: "mongodb",
      name: "MongoDB",
      description: "Monitor MongoDB databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/mongodb/",
      learnMoreUrl: "/docs/integration/database/mongodb/",
    },
    {
      id: "redis",
      name: "Redis",
      description: "Monitor Redis instances",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/redis/",
      learnMoreUrl: "/docs/integration/database/redis/",
    },
    {
      id: "dynamodb",
      name: "Amazon DynamoDB",
      description: "Monitor DynamoDB tables",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/dynamodb/",
      learnMoreUrl: "/docs/integration/database/dynamodb/",
    },
    {
      id: "zookeeper",
      name: "Apache Zookeeper",
      description: "Monitor Apache Zookeeper clusters",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/zookeeper/",
      learnMoreUrl: "/docs/integration/database/zookeeper/",
    },
    {
      id: "cassandra",
      name: "Cassandra",
      description: "Monitor Cassandra databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/cassandra/",
      learnMoreUrl: "/docs/integration/database/cassandra/",
    },
    {
      id: "aerospike",
      name: "Aerospike",
      description: "Monitor Aerospike databases",
      category: "database",
      icon: "",
      configureUrl: "/docs/integration/database/aerospike/",
      learnMoreUrl: "/docs/integration/database/aerospike/",
    },
    {
      id: "nginx",
      name: "Nginx",
      description: "Monitor Nginx server logs and metrics",
      category: "server",
      icon: "",
      configureUrl: "/docs/integration/servers/nginx/",
      learnMoreUrl: "/docs/integration/servers/nginx/",
    },
    {
      id: "weblogic",
      name: "Oracle Weblogic",
      description: "Monitor Oracle Weblogic servers",
      category: "server",
      icon: "",
      configureUrl: "/docs/integration/servers/weblogic/",
      learnMoreUrl: "/docs/integration/servers/weblogic/",
    },
    {
      id: "jenkins",
      name: "Jenkins",
      description: "Monitor Jenkins pipelines and builds",
      category: "devops",
      icon: "",
      configureUrl: "/docs/integration/devops/jenkins/",
      learnMoreUrl: "/docs/integration/devops/jenkins/",
    },
    {
      id: "ansible",
      name: "Ansible",
      description: "Monitor Ansible automation runs",
      category: "devops",
      icon: "",
      configureUrl: "/docs/integration/devops/ansible/",
      learnMoreUrl: "/docs/integration/devops/ansible/",
    },
    {
      id: "terraform",
      name: "Terraform",
      description: "Monitor Terraform deployments",
      category: "devops",
      icon: "",
      configureUrl: "/docs/integration/devops/terraform/",
      learnMoreUrl: "/docs/integration/devops/terraform/",
    },
    {
      id: "github-actions",
      name: "Github Actions",
      description: "Monitor GitHub Actions workflows",
      category: "devops",
      icon: "",
      configureUrl: "/docs/integration/devops/github-actions/",
      learnMoreUrl: "/docs/integration/devops/github-actions/",
    },
    {
      id: "kafka",
      name: "Kafka",
      description: "Monitor Kafka brokers and topics",
      category: "messaging",
      icon: "",
      configureUrl: "/docs/integration/message-brokers/kafka/",
      learnMoreUrl: "/docs/integration/message-brokers/kafka/",
    },
    {
      id: "rabbitmq",
      name: "RabbitMQ",
      description: "Monitor RabbitMQ queues and exchanges",
      category: "messaging",
      icon: "",
      configureUrl: "/docs/integration/message-brokers/rabbitmq/",
      learnMoreUrl: "/docs/integration/message-brokers/rabbitmq/",
    },
    {
      id: "nats",
      name: "NATS",
      description: "Monitor NATS messaging systems",
      category: "messaging",
      icon: "",
      configureUrl: "/docs/integration/message-brokers/nats/",
      learnMoreUrl: "/docs/integration/message-brokers/nats/",
    },
  ];

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

      const iconWrapper = document.createElement("div");
      iconWrapper.className =
        "landing-integration-icon " + colorClasses[index % colorClasses.length];

      const img = document.createElement("img");
      img.src = integration.icon;
      img.alt = integration.name;
      iconWrapper.appendChild(img);

      const textWrapper = document.createElement("div");
      textWrapper.className = "landing-integration-text";

      textWrapper.innerHTML = `
        <h3>${integration.name}</h3>
        <p>${integration.description}</p>
      `;

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

      card.append(iconWrapper, textWrapper, buttons);
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
