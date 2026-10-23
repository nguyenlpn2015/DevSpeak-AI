import { Question, FeedbackReport } from "@/types";

export const SEED_QUESTIONS: Question[] = [
  {
    id: "k8s-pod-crashloopbackoff",
    title: "Troubleshooting Kubernetes CrashLoopBackOff",
    prompt:
      "Imagine a critical microservice pod in your Kubernetes cluster is stuck in a CrashLoopBackOff state. How would you systematically troubleshoot and resolve this issue in a production environment?",
    role: "devops",
    topic: "kubernetes",
    difficulty: "mid",
    competencies: [
      "Kubernetes Core Architecture",
      "Production Incident Triage",
      "Container Lifecycle & Health Probes",
      "Resource Limits & OOM Debugging",
    ],
    rubric: {
      key_concepts: [
        "kubectl describe pod",
        "kubectl logs --previous",
        "exit code",
        "OOMKilled (Exit Code 137)",
        "liveness probe",
        "configmap/secret missing",
      ],
      star_method_applicable: false,
      evaluation_criteria: [
        "Systematic troubleshooting order (Inspect events -> Read previous logs -> Verify resources/env)",
        "Identification of common root causes (OOM, failed health probes, configuration errors)",
        "Clear, structured technical communication in English",
      ],
      common_pitfalls: [
        "Deleting the pod immediately without checking previous container logs",
        "Assuming it's only an application bug without verifying cluster-level resource quotas",
      ],
    },
    sample_answer:
      "When troubleshooting a CrashLoopBackOff pod in production, I follow a systematic three-step approach: inspecting events, analyzing previous container logs, and validating resource constraints. First, I run 'kubectl describe pod <pod-name>' to inspect the Events section and container termination details. If the exit code is 137, it indicates an OOMKilled error, meaning the container exceeded its configured memory limits. Second, because the container restarts repeatedly, I execute 'kubectl logs <pod-name> --previous' to examine the fatal stack trace or initialization exception prior to the crash. Third, I verify whether required secrets, ConfigMaps, or downstream database dependencies are unreachable. Once the root cause is confirmed—such as adjusting memory requests and limits or fixing a connection string—I apply the fix via the deployment manifest through GitOps.",
    follow_up_questions: [
      "If the CrashLoopBackOff container was caused by a database timeout rather than OOM, how would you configure the liveness and readiness probe timings?",
      "How do you configure pod anti-affinity and resource limits to prevent a single node from cascading into an OOM state?",
    ],
  },
  {
    id: "cicd-canary-rollback",
    title: "Automated Canary Release and Fast Rollback",
    prompt:
      "During an automated canary release, the HTTP 5xx error rate spikes above the acceptable threshold. Walk me through how your deployment pipeline detects this and executes an automated rollback with zero downtime.",
    role: "devops",
    topic: "cicd",
    difficulty: "senior",
    competencies: [
      "CI/CD Pipeline Automation",
      "Progressive Delivery & Canary Analysis",
      "SLO/SLA Threshold Monitoring",
      "Zero-Downtime Traffic Routing",
    ],
    rubric: {
      key_concepts: [
        "canary release",
        "progressive delivery",
        "metrics analysis (Prometheus/Datadog)",
        "error budget threshold",
        "automated rollback",
        "traffic routing",
        "Argo Rollouts/Flagger",
      ],
      star_method_applicable: false,
      evaluation_criteria: [
        "Clear explanation of metric thresholds triggering abort",
        "Mechanism of shifting traffic back to stable version instantly",
        "Post-rollback notifications and telemetry",
      ],
      common_pitfalls: [
        "Suggesting a manual redeploy instead of an automated pipeline abort",
        "Neglecting zero-downtime traffic switching mechanisms",
      ],
    },
    sample_answer:
      "In a modern progressive delivery architecture using tools like Argo Rollouts or Flagger, the canary deployment routes a small percentage—such as 10%—of user traffic to the new revision. The controller continuously evaluates Prometheus metrics against predefined analysis templates, specifically monitoring the HTTP 5xx error rate and P99 latency. If the error rate breaches the defined SLO threshold—for example, exceeding 1% over a 2-minute rolling window—the controller automatically triggers an abort action. It immediately shifts 100% of ingress traffic back to the stable replica set with zero downtime, scales down the faulty canary pods, and dispatches an incident notification to the on-call team via Slack or PagerDuty. This ensures that impact is strictly quarantined to a fraction of users before full promotion.",
    follow_up_questions: [
      "How would you handle database schema migrations when executing an automated canary rollback?",
      "What synthetic tests or end-to-end smoke checks would you execute before initiating the canary traffic ramp-up?",
    ],
  },
  {
    id: "aws-multiaz-cost-optimization",
    title: "AWS Multi-AZ VPC Architecture and Cost Optimization",
    prompt:
      "How would you design a highly available multi-AZ infrastructure on AWS for a mission-critical web application while optimizing data transfer and compute costs?",
    role: "cloud",
    topic: "aws",
    difficulty: "senior",
    competencies: [
      "AWS Well-Architected Framework",
      "VPC Networking & Subnet Topology",
      "Inter-AZ Data Transfer Cost Optimization",
      "Compute Economics (Savings Plans, Spot, Graviton)",
    ],
    rubric: {
      key_concepts: [
        "multi-AZ",
        "public and private subnets",
        "NAT Gateway / VPC Endpoints",
        "Application Load Balancer (ALB)",
        "Auto Scaling Groups",
        "Amazon Aurora / Multi-AZ RDS",
        "Savings Plans / Reserved Instances",
        "AWS Graviton",
      ],
      star_method_applicable: false,
      evaluation_criteria: [
        "Demonstration of high availability across at least two Availability Zones",
        "Cost reduction tactics (Gateway VPC Endpoints for S3/DynamoDB to bypass NAT Gateway fees)",
        "Compute cost strategies (Graviton, Savings Plans for baseline, Spot for asynchronous workloads)",
        "Secure tier isolation (databases and compute in private subnets)",
      ],
      common_pitfalls: [
        "Deploying a single NAT Gateway across multiple AZs creating a single point of failure or over-provisioning without cost analysis",
        "Overlooking inter-AZ data transfer fees between application servers and database replicas",
      ],
    },
    sample_answer:
      "To design a resilient multi-AZ AWS architecture while strictly controlling costs, I balance fault tolerance with network and compute economics. First, for high availability, I span the VPC across two Availability Zones with public, private application, and private database subnets. An Application Load Balancer distributes incoming HTTPS traffic across Auto Scaling groups in the private subnets. For persistence, Amazon Aurora Multi-AZ provides automated failover with sub-minute recovery and cross-AZ read replicas. Second, to optimize costs, data transfer through NAT Gateways is typically a primary expense. I deploy Gateway VPC Endpoints for S3 and DynamoDB at zero hourly cost, completely bypassing NAT Gateways. For internal service communications, I leverage Interface Endpoints. Third, on the compute layer, I migrate workloads to AWS Graviton3 processors which offer up to 20% better price-performance than x86. I apply Compute Savings Plans for baseline continuous capacity, utilize Spot Instances for stateless batch processing, and automate nightly shutdowns for non-production environments.",
    follow_up_questions: [
      "How do you monitor and allocate inter-AZ data transfer charges in AWS Cost Explorer?",
      "When would you recommend using a single NAT Gateway versus one NAT Gateway per Availability Zone?",
    ],
  },
  {
    id: "linux-iowait-performance",
    title: "Diagnosing High CPU I/O Wait in Linux",
    prompt:
      "Your team alerts you that a critical database host has a CPU wait (iowait) spiking over 60%, causing severe latency. Which Linux CLI tools would you run, and how would you identify the root cause?",
    role: "devops",
    topic: "linux_sre",
    difficulty: "senior",
    competencies: [
      "Linux Kernel & Storage Subsystem",
      "Performance Profiling CLI Tools",
      "I/O Bottleneck Identification",
      "Production Troubleshooting",
    ],
    rubric: {
      key_concepts: [
        "iowait (%wa)",
        "vmstat / top",
        "iostat -xz 1",
        "iotop",
        "disk saturation / queue length",
        "dmesg / storage errors",
      ],
      star_method_applicable: false,
      evaluation_criteria: [
        "Correct interpretation of %wa in top/vmstat",
        "Use of iostat to check disk utilization (%util, await, r/s, w/s)",
        "Identifying the specific PID causing excessive write/read load with iotop or pidstat",
      ],
      common_pitfalls: [
        "Assuming high CPU utilization means compute shortage rather than blocked storage I/O",
        "Restarting the server without identifying which process saturated the storage device",
      ],
    },
    sample_answer:
      "A high iowait percentage indicates that CPU cores are idle waiting for outstanding I/O requests to complete on block devices. To diagnose this, I start with 'top' or 'vmstat 1' to confirm the %wa metric and examine blocked processes in the 'b' column. Next, I execute 'iostat -xz 1' to inspect per-device statistics. I look closely at '%util', average request queue size, and 'await' times. If %util is close to 100% and await exceeds disk tolerance, the storage subsystem is saturated. To pinpoint the offending process, I run 'iotop -o' or 'pidstat -d 1', which reveals the exact process IDs performing heavy disk reads or writes. Finally, I check 'dmesg -T' to rule out hardware block errors or filesystem corruption. This informs whether we need to throttle a runaway batch job, optimize database indexes, or increase storage IOPS.",
    follow_up_questions: [
      "If iowait is caused by an unindexed PostgreSQL table undergoing full table scans, how would you remediate it without restarting the database?",
      "Can you explain the difference between load average and CPU utilization in a Linux system?",
    ],
  },
  {
    id: "behavioral-production-outage",
    title: "Managing a Critical Demo Outage (STAR)",
    prompt:
      "Tell me about a time when a production incident occurred during a critical business event or demo. How did you manage technical resolution and stakeholder communication?",
    role: "general_it",
    topic: "behavioral",
    difficulty: "mid",
    competencies: [
      "Behavioral Communication (STAR Framework)",
      "Incident Command & Stakeholder Management",
      "Root Cause Analysis & Blameless Postmortems",
      "Composure Under Pressure",
    ],
    rubric: {
      key_concepts: [
        "Situation context",
        "Task ownership",
        "Action taken (triage, communication, rollback/hotfix)",
        "Result (metric outcome, blameless postmortem)",
        "Incident commander role",
        "Calm, transparent communication",
      ],
      star_method_applicable: true,
      evaluation_criteria: [
        "Clear adherence to STAR framework (Situation, Task, Action, Result)",
        "Demonstration of ownership, emotional composure, and clear communication under pressure",
        "Mention of preventative actions taken after the incident",
      ],
      common_pitfalls: [
        "Focusing entirely on technical details while ignoring business communication",
        "Blaming other team members or external vendors without showing personal ownership",
      ],
    },
    sample_answer:
      "During a high-stakes customer executive demo at my previous company, our core authentication service experienced a sudden outage due to a database connection pool exhaustion triggered by an unindexed query. [Situation] As the on-call DevOps engineer, my responsibility was twofold: quickly mitigate the customer-facing impact and maintain transparent communication with the sales engineering team in the demo room. [Task] I immediately established an incident call, assigned myself Incident Commander, and notified stakeholders via a dedicated Slack bridge with 10-minute cadence updates. On the technical side, rather than debugging the slow query live, I executed a fast rollback to the prior stable release and temporarily doubled the read-replica connection pool. [Action] The service recovered within 7 minutes, enabling the demo to conclude successfully. Afterward, I authored a blameless postmortem, implemented automated query latency alerts, and added strict connection pool thresholds to our staging integration tests. [Result]",
    follow_up_questions: [
      "Looking back at that incident, what is one thing you would do differently if a similar outage occurred tomorrow?",
      "How did you help the team re-establish stakeholder confidence after the incident concluded?",
    ],
  },
  {
    id: "docker-multistage-caching",
    title: "Docker Multi-Stage Builds & Layer Optimization",
    prompt:
      "How do you optimize Docker image builds for security and efficiency? Explain how multi-stage builds and layer caching work in practice.",
    role: "devops",
    topic: "docker",
    difficulty: "junior",
    competencies: [
      "Container Image Best Practices",
      "Dockerfile Layer Optimization",
      "Supply Chain & Container Security",
      "Build Automation Performance",
    ],
    rubric: {
      key_concepts: [
        "multi-stage build",
        "layer caching",
        "minimal base image (distroless/alpine)",
        "non-root user",
        ".dockerignore",
        "attack surface reduction",
      ],
      star_method_applicable: false,
      evaluation_criteria: [
        "Understanding build stage separation (builder vs runtime)",
        "Ordering Dockerfile commands from least to most frequently changing for cache hits",
        "Security benefits of eliminating compilers and package managers in runtime images",
      ],
      common_pitfalls: [
        "Leaving build tools and package caches inside the production container",
        "Copying source code before dependency files, which invalidates the layer cache on every commit",
      ],
    },
    sample_answer:
      "To optimize Docker images for both efficiency and security, I employ multi-stage builds and strategic layer caching. First, multi-stage builds separate the build environment from the final runtime image. In the builder stage, we compile source code and install SDKs. Then, in the runtime stage, we copy only the compiled binaries or production artifacts into a minimal base image, such as Distroless or Alpine Linux. This reduces image size from hundreds of megabytes to tens of megabytes and eliminates compilers, drastically shrinking the security attack surface. Second, for layer caching, I structure the Dockerfile so that rarely changing files—such as package.json or requirements.txt—are copied first, followed by dependency installation. Source code is copied in the final layers, ensuring cache hits on dependency layers during continuous commits.",
    follow_up_questions: [
      "How do you implement image vulnerability scanning in the CI pipeline before pushing to the container registry?",
      "What is the difference between ADD and COPY in a Dockerfile, and when would you prefer one over the other?",
    ],
  },
];

export function evaluateOfflineLocally(
  question: Question,
  userAnswer: string
): FeedbackReport {
  const lower = userAnswer.toLowerCase();
  const words = lower.match(/\b\w+\b/g) || [];
  const wordCount = words.length;

  const matched = question.rubric.key_concepts.filter((concept) => {
    const clean = concept.toLowerCase().replace(/\(.*?\)/g, "").trim();
    if (clean && lower.includes(clean)) return true;
    const parts = clean.split("/");
    if (parts.some((p) => p.trim().length > 3 && lower.includes(p.trim()))) return true;
    if (clean.includes("137") && (lower.includes("137") || lower.includes("oom"))) return true;
    if (clean.includes("oom") && lower.includes("oom")) return true;
    return false;
  });

  const missing = question.rubric.key_concepts.filter((c) => !matched.includes(c));
  const ratio = matched.length / Math.max(question.rubric.key_concepts.length, 1);

  const technicalScore = ratio >= 0.7 ? 9 : ratio >= 0.4 ? 7 : ratio >= 0.2 ? 5 : 4;
  const clarityScore = wordCount >= 60 ? 9 : wordCount >= 30 ? 7 : 5;
  const grammarScore = wordCount >= 30 ? 8 : 6;
  const overall = Number((0.4 * technicalScore + 0.3 * clarityScore + 0.3 * grammarScore).toFixed(1));

  return {
    question_id: question.id,
    scores: {
      grammar_score: grammarScore,
      technical_score: technicalScore,
      clarity_score: clarityScore,
      overall_score: overall,
    },
    feedback: {
      grammar_feedback: [
        "Professional tone and clear sentence structure suitable for international IT interviews.",
      ],
      technical_feedback: [
        matched.length > 0
          ? `Demonstrated domain familiarity by including key concepts: ${matched.slice(0, 3).join(", ")}.`
          : "Consider integrating more topic-specific technical terminology.",
        ...(missing.length > 0
          ? [`Recommended concepts to enrich your answer: ${missing.slice(0, 3).join(", ")}.`]
          : []),
      ],
      clarity_structure_feedback: [
        "Good logical progression. For maximum impact, consider structuring explanations chronologically (Initial triage -> Root cause isolation -> Permanent mitigation).",
      ],
    },
    model_answer: question.sample_answer,
    suggested_followups: question.follow_up_questions.slice(0, 2),
    disclaimer:
      "This evaluation is generated by DevSpeak AI's deterministic heuristic mock provider for practice purposes only. It is heuristic feedback, not an objectively validated standardized measurement of English proficiency.",
  };
}

