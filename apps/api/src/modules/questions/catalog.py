"""Seed catalog of production-grade IT & DevOps interview questions."""

from src.modules.questions.schemas import (
    Difficulty,
    Question,
    QuestionListResponse,
    QuestionRubric,
    QuestionSummary,
    RoleCategory,
    Topic,
)

DEVOPS_QUESTIONS: list[Question] = [
    # =========================================================================
    # 1. KUBERNETES & CONTAINER ORCHESTRATION
    # =========================================================================
    Question(
        id="k8s-pod-crashloopbackoff",
        title="Troubleshooting Kubernetes CrashLoopBackOff",
        prompt=(
            "Imagine a critical microservice pod in your Kubernetes cluster is stuck in a "
            "CrashLoopBackOff state. How would you systematically troubleshoot and resolve this "
            "issue in a production environment?"
        ),
        role="devops",
        topic="kubernetes",
        difficulty="mid",
        competencies=[
            "Kubernetes Core Architecture",
            "Production Incident Triage",
            "Container Lifecycle & Health Probes",
            "Resource Limits & OOM Debugging",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "kubectl describe pod",
                "kubectl logs --previous",
                "exit code",
                "OOMKilled (Exit Code 137)",
                "liveness probe",
                "configmap/secret missing",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Systematic troubleshooting order (Inspect events -> Read previous logs -> Verify resources/env)",
                "Identification of common root causes (OOM, failed health probes, configuration errors)",
                "Clear, structured technical communication in English",
            ],
            common_pitfalls=[
                "Deleting the pod immediately without checking previous container logs",
                "Assuming it's only an application bug without verifying cluster-level resource quotas",
            ],
        ),
        sample_answer=(
            "When troubleshooting a CrashLoopBackOff pod in production, I follow a systematic three-step approach: "
            "inspecting events, analyzing previous container logs, and validating resource constraints. "
            "First, I run 'kubectl describe pod <pod-name>' to inspect the Events section and container termination details. "
            "If the exit code is 137, it indicates an OOMKilled error, meaning the container exceeded its configured memory limits. "
            "Second, because the container restarts repeatedly, I execute 'kubectl logs <pod-name> --previous' to examine "
            "the fatal stack trace or initialization exception prior to the crash. "
            "Third, I verify whether required secrets, ConfigMaps, or downstream database dependencies are unreachable. "
            "Once the root cause is confirmed—such as adjusting memory requests and limits or fixing a connection string—I "
            "apply the fix via the deployment manifest through GitOps."
        ),
        follow_up_questions=[
            "If the CrashLoopBackOff container was caused by a database timeout rather than OOM, how would you configure the liveness and readiness probe timings?",
            "How do you configure pod anti-affinity and resource limits to prevent a single node from cascading into an OOM state?",
        ],
    ),
    Question(
        id="k8s-ingress-dns-troubleshooting",
        title="Kubernetes Ingress & CoreDNS Resolution Failures",
        prompt=(
            "Users report HTTP 503 Service Unavailable when accessing an external endpoint routed through your NGINX Ingress controller. "
            "At the same time, internal pods cannot resolve the service domain via CoreDNS. How do you triage this network failure?"
        ),
        role="devops",
        topic="kubernetes",
        difficulty="mid",
        competencies=[
            "Kubernetes Ingress Controllers",
            "CoreDNS & Service Discovery",
            "Endpoints & Service Selectors",
            "Cluster Networking (CNI)",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "kubectl get endpoints",
                "CoreDNS pod logs",
                "nginx ingress controller logs",
                "service selector mismatch",
                "resolv.conf / ndots",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Verifies Service Endpoints to see if pods are backing the service",
                "Inspects CoreDNS deployment health and upstream DNS forwarding",
                "Checks Ingress routing rules and backend readiness states",
            ],
            common_pitfalls=[
                "Blaming external DNS before checking internal CoreDNS and endpoints",
                "Overlooking unready pods that drop off the Endpoints object",
            ],
        ),
        sample_answer=(
            "An HTTP 503 at the Ingress layer almost always means the ingress controller has no active backend endpoints to route traffic to. "
            "I begin by running 'kubectl get endpoints <service-name>' in the namespace to verify if any pod IP addresses are registered. "
            "If the endpoints list is empty, I check whether the pods failed their readiness probes or if there is a label selector mismatch between "
            "the Service spec and the Deployment pod template. "
            "Next, to address the internal CoreDNS issue, I check the CoreDNS deployment with 'kubectl logs -n kube-system -l k8s-app=kube-dns'. "
            "I test resolution inside a debug pod using 'nslookup' and inspect '/etc/resolv.conf' to verify the cluster DNS IP and ndots configuration. "
            "Usually, resolving the endpoint availability restores the 503, while ensuring CoreDNS has sufficient replicas and CPU prevents internal timeouts."
        ),
        follow_up_questions=[
            "What is the significance of the ndots:5 setting in Kubernetes, and how can it impact DNS performance in high-throughput clusters?",
            "How does kube-proxy handle iptables or IPVS rules when an endpoint fails its readiness check?",
        ],
    ),
    Question(
        id="k8s-resource-limits-oom",
        title="Kubernetes Requests vs Limits & Quality of Service (QoS)",
        prompt=(
            "Explain the difference between resource requests and limits in Kubernetes. "
            "How does the kubelet use these values to determine Quality of Service (QoS) classes and eviction order during node pressure?"
        ),
        role="devops",
        topic="kubernetes",
        difficulty="junior",
        competencies=[
            "Pod Scheduling & kube-scheduler",
            "Resource Quotas & cgroups",
            "Kubernetes QoS Classes",
            "Node Pressure & Eviction",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "CPU requests vs limits",
                "Memory requests vs limits",
                "QoS Classes: Guaranteed, Burstable, BestEffort",
                "cgroups CFS quota (CPU throttling)",
                "OOM score adjust",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Accurately explains requests for scheduling vs limits for runtime ceiling",
                "Defines all 3 QoS classes (Guaranteed, Burstable, BestEffort)",
                "Contrasts CPU throttling with Memory OOM termination",
            ],
            common_pitfalls=[
                "Thinking CPU exceeding limits causes pod kill (it throttles, unlike memory OOM)",
                "Confusing node scheduling with runtime enforcement",
            ],
        ),
        sample_answer=(
            "In Kubernetes, 'requests' define the minimum guaranteed resources required for the kube-scheduler to place a pod on a node. "
            "'Limits' define the hard upper bound enforced at runtime via Linux cgroups. "
            "A critical distinction is that CPU is a compressible resource: exceeding CPU limits results in CPU throttling via CFS quotas, "
            "whereas memory is incompressible: exceeding memory limits triggers the Linux OOM killer with Exit Code 137. "
            "Kubernetes calculates QoS classes based on these settings: Guaranteed (requests equal limits for all containers), "
            "Burstable (requests are less than limits), and BestEffort (no requests or limits set). "
            "Under node memory pressure, the kubelet evicts BestEffort pods first, followed by Burstable pods exceeding requests, "
            "while Guaranteed pods are strictly preserved."
        ),
        follow_up_questions=[
            "Why do many cloud-native teams recommend omitting CPU limits while strictly enforcing memory limits?",
            "How does the Vertical Pod Autoscaler (VPA) recommend optimal requests based on historical usage?",
        ],
    ),
    Question(
        id="k8s-cni-network-policies",
        title="Securing Microservices with Kubernetes NetworkPolicies",
        prompt=(
            "By default, all pods in a Kubernetes cluster can communicate with each other. "
            "How do you design and enforce zero-trust NetworkPolicies using a CNI like Calico or Cilium to isolate a payment processing tier?"
        ),
        role="devops",
        topic="kubernetes",
        difficulty="senior",
        competencies=[
            "Zero Trust Architecture",
            "Kubernetes NetworkPolicy Spec",
            "CNI Plugins (Calico / Cilium / eBPF)",
            "Ingress and Egress Isolation",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "default-deny ingress/egress",
                "podSelector and namespaceSelector",
                "CNI plugin requirement (Calico/Cilium)",
                "ports and protocol lockdown",
                "eBPF vs iptables filtering",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Starts with a default-deny ingress and egress policy",
                "Applies explicit allow-list for payment tier using pod selectors",
                "Notes that standard cloud provider basic CNI may not enforce NetworkPolicies without add-ons",
            ],
            common_pitfalls=[
                "Applying NetworkPolicy without verifying if the CNI plugin actually supports enforcement",
                "Forgetting egress rules, allowing compromised pods to exfiltrate data externally",
            ],
        ),
        sample_answer=(
            "To enforce zero-trust isolation for our payment tier, I first ensure our CNI plugin—such as Calico or Cilium with eBPF—is configured to enforce NetworkPolicies. "
            "I implement a defense-in-depth approach starting with a baseline 'default-deny-all' NetworkPolicy for both ingress and egress in the payment namespace. "
            "Next, I define a specific NetworkPolicy targeting pods with label 'app: payment-api'. "
            "For Ingress, I only allow traffic from pods labeled 'app: order-api' on TCP port 8443, rejecting all other namespaces. "
            "For Egress, I explicitly permit connections only to the payment gateway external IP/CIDR on port 443 and the cluster CoreDNS IP on port 53. "
            "Using Cilium allows us to validate these flows via Hubble observability and implement L7 DNS-aware egress policies."
        ),
        follow_up_questions=[
            "How do you test NetworkPolicy rollouts in staging without risking accidental outage of legitimate inter-service traffic?",
            "What advantages does eBPF in Cilium provide over traditional iptables-based CNI implementations?",
        ],
    ),

    # =========================================================================
    # 2. CI/CD & CONTINUOUS DELIVERY
    # =========================================================================
    Question(
        id="cicd-canary-rollback",
        title="Automated Canary Release and Fast Rollback",
        prompt=(
            "During an automated canary release, the HTTP 5xx error rate spikes above the acceptable threshold. "
            "Walk me through how your deployment pipeline detects this and executes an automated rollback with zero downtime."
        ),
        role="devops",
        topic="cicd",
        difficulty="senior",
        competencies=[
            "CI/CD Pipeline Automation",
            "Progressive Delivery & Canary Analysis",
            "SLO/SLA Threshold Monitoring",
            "Zero-Downtime Traffic Routing",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "canary release",
                "progressive delivery",
                "metrics analysis (Prometheus/Datadog)",
                "error budget threshold",
                "automated rollback",
                "traffic routing",
                "Argo Rollouts/Flagger",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Clear explanation of metric thresholds triggering abort",
                "Mechanism of shifting traffic back to stable version instantly",
                "Post-rollback notifications and telemetry",
            ],
            common_pitfalls=[
                "Suggesting a manual redeploy instead of an automated pipeline abort",
                "Failing to mention instant traffic shifting at the ingress/service mesh level",
            ],
        ),
        sample_answer=(
            "Our automated progressive delivery leverages Argo Rollouts combined with Prometheus metric analysis. "
            "When a new image is deployed, the pipeline shifts 5% of production traffic to the canary replica. "
            "An AnalysisTemplate executes continuously, querying Prometheus for the HTTP 5xx error rate and P99 latency over 2-minute rolling windows. "
            "If the error rate exceeds our 1% threshold, the AnalysisRun immediately transitions to Failed. "
            "Argo Rollouts catches this failure, halts the rollout, and instantly routes 100% of ingress traffic back to the stable ReplicaSet. "
            "The canary pods are gracefully scaled down, an alert is dispatched to our on-call Slack channel with the offending commit SHA, "
            "and the service experiences zero customer-facing downtime."
        ),
        follow_up_questions=[
            "How do you manage database schema migrations when executing canary releases where old and new versions run concurrently?",
            "What is the difference between synthetic traffic testing and live traffic mirroring during canary evaluation?",
        ],
    ),
    Question(
        id="cicd-pipeline-security-sast",
        title="Shifting Security Left in CI/CD (SAST, SCA, and Image Signing)",
        prompt=(
            "How do you design a secure CI/CD pipeline that enforces security controls—such as secret scanning, SAST, dependency scanning, and image signing—without significantly slowing down developer velocity?"
        ),
        role="devops",
        topic="cicd",
        difficulty="mid",
        competencies=[
            "DevSecOps Architecture",
            "Supply Chain Security",
            "Pipeline Caching & Concurrency",
            "Container Signing (Cosign)",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Gitleaks / Secret scanning",
                "SAST (Semgrep / SonarQube)",
                "SCA / Dependency scanning (Trivy / Snyk)",
                "Cosign / Sigstore image signing",
                "Parallel pipeline stages",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Explains multi-stage automated security gates",
                "Optimizes execution time with concurrency and layer caching",
                "Mentions cryptographic signing and SBOM generation",
            ],
            common_pitfalls=[
                "Running security tools sequentially, causing 30-minute pipeline bottlenecks",
                "Blocking builds on low-severity non-exploitable vulnerabilities",
            ],
        ),
        sample_answer=(
            "To shift security left without hurting velocity, I structure our CI/CD pipeline with parallel execution and tiered blocking thresholds. "
            "In pre-commit or the fastest first stage, we run lightweight secret scanning with Gitleaks and linting in under 30 seconds. "
            "In parallel with the test suite, we execute SAST using Semgrep rules and SCA using Trivy to audit lockfiles. "
            "We only block pull requests on Critical or High CVEs with known exploit paths, generating warnings for lower severities. "
            "During container packaging, we leverage multi-stage build cache mounts. Once built, the image is scanned for OS vulnerabilities, "
            "an SBOM is generated with Syft, and the image digest is signed using Cosign via Sigstore keyless signing before pushing to ECR."
        ),
        follow_up_questions=[
            "How do you prevent developer credentials or pipeline tokens from being leaked in CI runner logs?",
            "What is SLSA (Supply-chain Levels for Software Artifacts) and which level does your pipeline satisfy?",
        ],
    ),
    Question(
        id="cicd-gitops-argo-flux",
        title="GitOps Workflows with ArgoCD and Drift Detection",
        prompt=(
            "Explain the GitOps operating model. How does ArgoCD detect configuration drift between the Git repository and the live Kubernetes cluster, and how do you handle manual emergency hotfixes?"
        ),
        role="devops",
        topic="cicd",
        difficulty="mid",
        competencies=[
            "GitOps Methodology",
            "ArgoCD / Flux Architecture",
            "Declarative State Reconciliation",
            "Disaster Recovery & Drift Handling",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Single source of truth (Git)",
                "Reconciliation loop",
                "Drift detection (OutOfSync)",
                "Self-healing / auto-sync",
                "Emergency hotfix workflow",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Articulates why Git as single source of truth enhances auditability",
                "Explains the ArgoCD controller reconciliation mechanism",
                "Proposes a clean pattern for hotfixes without breaking GitOps synchronization",
            ],
            common_pitfalls=[
                "Accepting manual kubectl edits without backporting to Git",
                "Disabling auto-sync indefinitely during incidents",
            ],
        ),
        sample_answer=(
            "GitOps establishes Git as the single, declarative source of truth for all infrastructure and application state. "
            "ArgoCD runs a continuous reconciliation loop, comparing the desired manifests in Git against the live state returned by the Kubernetes API. "
            "When someone manually alters a resource—or when a new commit lands—ArgoCD marks the application as 'OutOfSync'. "
            "If auto-sync and self-healing are enabled, it automatically overrides the cluster to match Git. "
            "During production emergencies where a hotfix is urgently required, we never bypass GitOps long-term. "
            "Engineers can temporarily pause auto-sync for rapid iteration, but the immediate post-incident remediation requires committing the change to Git and re-enabling auto-sync to eliminate configuration drift."
        ),
        follow_up_questions=[
            "How do you manage sensitive secrets in a public or shared GitOps repository?",
            "What are the trade-offs between Helm charts and Kustomize overlays in an ArgoCD multi-environment repository?",
        ],
    ),
    Question(
        id="cicd-artifact-caching-speed",
        title="Optimizing CI Build Performance & Dependency Caching",
        prompt=(
            "Your team's pull request builds take over 25 minutes, with 80% of the time spent downloading npm packages, compiling Python wheels, and pulling Docker base images. How would you optimize this pipeline to run under 4 minutes?"
        ),
        role="devops",
        topic="cicd",
        difficulty="junior",
        competencies=[
            "Pipeline Performance Engineering",
            "Package Manager Caching",
            "Docker BuildKit Cache Mounts",
            "Self-Hosted Runners vs SaaS",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "actions/cache based on lockfile hash",
                "Docker BuildKit --mount=type=cache",
                "docker/build-push-action registry cache",
                "ephemeral vs persistent runners",
                "parallel job matrix",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Identifies dependency lockfile cache keying",
                "Uses BuildKit layer caching and inline/registry cache",
                "Splits monolithic jobs into parallel independent steps",
            ],
            common_pitfalls=[
                "Running 'npm install' or 'pip install' without cache keys on every run",
                "Not leveraging Docker BuildKit cache features",
            ],
        ),
        sample_answer=(
            "To reduce build times from 25 minutes to under 4 minutes, I implement a comprehensive caching and concurrency strategy. "
            "First, for dependencies, I configure pipeline cache actions keyed on lockfile hashes (package-lock.json and requirements.txt). "
            "This ensures npm ci and pip install execute in seconds unless dependencies actually changed. "
            "Second, for container packaging, I enable Docker BuildKit with '--mount=type=cache' for package manager caches and use "
            "'cache-from' and 'cache-to' with GitHub Actions cache or an ECR registry cache backend. "
            "Third, I parallelize the test suites across matrix runners and separate unit tests from slower integration tests. "
            "Finally, ordering Dockerfile statements with dependencies copied before source code ensures maximum layer cache hits."
        ),
        follow_up_questions=[
            "When using GitHub Actions cache, what are the storage limits and eviction policies you need to monitor?",
            "How does BuildKit's multi-stage target execution avoid building unnecessary stages?",
        ],
    ),

    # =========================================================================
    # 3. LINUX SRE & PERFORMANCE TRIAGE
    # =========================================================================
    Question(
        id="linux-iowait-performance",
        title="Diagnosing High iowait and Disk Bottlenecks",
        prompt=(
            "Your monitoring system alerts you that a critical database host has a CPU wait (iowait) spiking over 60%, causing severe latency. "
            "Which Linux CLI tools would you run, and how would you identify the root cause?"
        ),
        role="devops",
        topic="linux_sre",
        difficulty="mid",
        competencies=[
            "Linux Kernel & Storage Subsystem",
            "Performance Profiling CLI Tools",
            "I/O Bottleneck Identification",
            "Production Troubleshooting",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "iowait (%wa)",
                "vmstat / top",
                "iostat -xz 1",
                "iotop",
                "disk saturation / queue length",
                "dmesg / storage errors",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Correct interpretation of %wa in top/vmstat",
                "Use of iostat to check disk utilization (%util, await, r/s, w/s)",
                "Identifying the specific PID causing excessive write/read load with iotop or pidstat",
            ],
            common_pitfalls=[
                "Assuming high CPU utilization means compute shortage rather than blocked storage I/O",
                "Restarting the server without identifying which process saturated the storage device",
            ],
        ),
        sample_answer=(
            "A high iowait percentage indicates that CPU cores are idle waiting for outstanding I/O requests to complete on block devices. "
            "To diagnose this, I start with 'top' or 'vmstat 1' to confirm the %wa metric and examine blocked processes in the 'b' column. "
            "Next, I execute 'iostat -xz 1' to inspect per-device statistics. I look closely at '%util', average request queue size, and 'await' times. "
            "If %util is close to 100% and await exceeds disk tolerance, the storage subsystem is saturated. "
            "To pinpoint the offending process, I run 'iotop -o' or 'pidstat -d 1', which reveals the exact process IDs performing heavy disk reads or writes. "
            "Finally, I check 'dmesg -T' to rule out hardware block errors or filesystem corruption. "
            "This informs whether we need to throttle a runaway batch job, optimize database indexes, or increase storage IOPS."
        ),
        follow_up_questions=[
            "If iowait is caused by an unindexed PostgreSQL table undergoing full table scans, how would you remediate it without restarting the database?",
            "Can you explain the difference between load average and CPU utilization in a Linux system?",
        ],
    ),
    Question(
        id="linux-oomkilled-cgroup-limits",
        title="Linux Kernel OOM Killer & Memory Overcommit",
        prompt=(
            "An application process suddenly disappears from your Linux server without generating an application log. "
            "How do you confirm if it was terminated by the Linux OOM Killer, and how does the kernel calculate the oom_score?"
        ),
        role="devops",
        topic="linux_sre",
        difficulty="mid",
        competencies=[
            "Linux Virtual Memory & Pages",
            "OOM Killer Algorithm",
            "Kernel Logs (dmesg / journalctl)",
            "Memory Overcommit Settings",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "dmesg -T | grep -i oom",
                "oom_score and oom_score_adj",
                "Exit code 137 (SIGKILL)",
                "vm.overcommit_memory",
                "/proc/[pid]/oom_score",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Commands to inspect kernel ring buffer for OOM events",
                "Explains oom_score heuristics (RAM usage percentage vs priority adjustment)",
                "Discusses sysctl memory overcommit modes (0, 1, 2)",
            ],
            common_pitfalls=[
                "Looking only in application logs instead of dmesg/kernel logs",
                "Confusing SIGTERM (graceful shutdown) with kernel SIGKILL (immediate termination)",
            ],
        ),
        sample_answer=(
            "When a process disappears without an application stack trace, my first step is inspecting the kernel ring buffer with 'dmesg -T | grep -i oom' or 'journalctl -k'. "
            "An OOM event logs the killed process name, PID, RSS pages, and the total system memory state at the moment of invocation. "
            "The Linux kernel determines which process to terminate based on its 'oom_score', located in '/proc/<PID>/oom_score'. "
            "This score represents the proportion of RAM the process consumes, modified by '/proc/<PID>/oom_score_adj' (-1000 to +1000). "
            "Processes with higher scores are terminated first to free the maximum memory with minimal system disruption. "
            "To prevent frequent OOMs, we can tune 'vm.overcommit_memory' and ensure containers have calibrated limits with swap disabled for deterministic behavior."
        ),
        follow_up_questions=[
            "What does 'vm.overcommit_memory = 2' do, and how is the overcommit ratio calculated against swap space?",
            "How does cgroup v2 improve memory throttling and OOM management compared to cgroup v1?",
        ],
    ),
    Question(
        id="linux-load-average-vs-cpu",
        title="Linux Load Average vs CPU Utilization",
        prompt=(
            "Your 4-core server shows a 1-minute load average of 16.0, yet 'top' reports only 25% CPU utilization. "
            "How is this mathematically possible, and what does it tell you about system health?"
        ),
        role="devops",
        topic="linux_sre",
        difficulty="junior",
        competencies=[
            "Linux Process States (R vs D)",
            "CPU Scheduling & Runqueue",
            "System Performance Metrics",
            "Uninterruptible Sleep",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Task state R (Running/Runnable)",
                "Task state D (Uninterruptible sleep / Disk wait)",
                "Load average counts both R and D states",
                "NFS / Disk I/O deadlock",
                "vmstat 'b' column",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Explains that Linux load average includes processes in state D (uninterruptible sleep)",
                "Identifies that low CPU with high load implies processes blocked on I/O or locks",
                "Mentions commands like vmstat or ps to inspect process state columns",
            ],
            common_pitfalls=[
                "Claiming load average is simply the percentage of CPU utilized",
                "Assuming the server must be CPU bound",
            ],
        ),
        sample_answer=(
            "This scenario is common in Linux because the load average metric does not simply measure CPU consumption. "
            "In Linux, load average represents the average number of tasks in either state 'R' (running or runnable on the CPU) "
            "OR state 'D' (uninterruptible sleep, typically waiting on disk I/O, NFS, or hardware locks). "
            "If CPU utilization is only 25% on a 4-core machine but the load average is 16.0, it means roughly 15 processes are queued in state 'D'. "
            "They are not executing instructions, so CPU usage remains low, but they are blocked waiting on an I/O subsystem. "
            "Running 'vmstat 1' will show a high number in the 'b' column (blocked), and 'ps aux | awk \"$8 ~ /D/\"' reveals the exact processes waiting on I/O."
        ),
        follow_up_questions=[
            "Why did Linux creators choose to include uninterruptible sleep state D in load average, unlike classic Unix systems?",
            "What happens if an NFS mount hangs while processes are attempting to write to it?",
        ],
    ),
    Question(
        id="linux-network-packet-loss-tcpdump",
        title="Troubleshooting High Network Latency and Packet Drops with tcpdump",
        prompt=(
            "Two microservices in the same private subnet experience intermittent 2-second connection timeouts. "
            "How would you use Linux networking tools—such as ip, ss, netstat, and tcpdump—to isolate whether packet drops happen at the kernel buffer, NIC, or application layer?"
        ),
        role="devops",
        topic="linux_sre",
        difficulty="senior",
        competencies=[
            "TCP/IP Handshake & Retransmissions",
            "Linux Network Stack (sk_buff / ring buffers)",
            "Packet Capture Analysis (tcpdump / Wireshark)",
            "Socket Diagnostics (ss / netstat)",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "tcpdump -i eth0 -nn -s0",
                "TCP SYN retransmission (1s, 3s backoff)",
                "netstat -s | grep -i retrans",
                "ethtool -S rx_dropped / rx_missed_errors",
                "ss -tlpn listen backlog overflow",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Identifies that 1-2 second timeouts typically correspond to initial TCP SYN retransmission timers",
                "Uses tcpdump to verify if packets arrive on wire vs reach socket",
                "Checks socket listen backlog queue drops with ss or netstat",
            ],
            common_pitfalls=[
                "Assuming application bug without verifying TCP handshake packet flow",
                "Running tcpdump without port/host filters in high-traffic production",
            ],
        ),
        sample_answer=(
            "Intermittent 1-to-2 second connection timeouts strongly suggest initial TCP SYN retransmissions caused by packet drops or unserviced socket queues. "
            "My triage follows the network path from the physical layer up to the application. "
            "First, I check NIC and ring buffer metrics with 'ethtool -S <interface>' and 'ip -s link' to verify if packets are dropped at the hardware buffer. "
            "Second, I inspect socket backlogs using 'ss -lnt'. If the Send-Q is full, the application's accept() loop is overwhelmed, causing the kernel to drop incoming SYN packets. "
            "Third, I capture traffic between the two hosts using 'tcpdump -i any -nn host <client_ip> and host <server_ip> and port <port> -w trace.pcap'. "
            "Inspecting the capture confirms whether SYN packets arrive without receiving SYN-ACKs, isolating whether the issue is network routing, security groups, or application thread exhaustion."
        ),
        follow_up_questions=[
            "How do Linux sysctl settings 'net.core.somaxconn' and 'net.ipv4.tcp_max_syn_backlog' affect connection handling under high traffic?",
            "What is the difference between TCP Keepalive and HTTP-level keep-alive?",
        ],
    ),

    # =========================================================================
    # 4. AWS & CLOUD ARCHITECTURE
    # =========================================================================
    Question(
        id="aws-multiaz-cost-optimization",
        title="Multi-AZ High Availability vs Cloud Cost Optimization",
        prompt=(
            "Your company's AWS cloud bill has surged by 40% due to inter-AZ data transfer fees across an EKS microservices architecture. "
            "How do you re-architect the infrastructure to maintain high availability while drastically reducing data transfer costs?"
        ),
        role="cloud",
        topic="aws",
        difficulty="senior",
        competencies=[
            "AWS Networking & Cost Optimization",
            "Multi-AZ Resiliency & Disaster Recovery",
            "Kubernetes Topology Aware Routing",
            "VPC Endpoint Architecture",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "inter-AZ data transfer costs",
                "topologySpreadConstraints",
                "Topology Aware Hints / Routing",
                "VPC Endpoints (PrivateLink vs Gateway)",
                "Internal caching (Redis / Memcached)",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Explains that cross-AZ traffic in AWS incurs bidirectional charges ($0.01/GB)",
                "Applies Kubernetes topology-aware hints to keep request traffic within the same AZ",
                "Recommends VPC Gateway Endpoints for S3/DynamoDB to eliminate NAT Gateway data fees",
            ],
            common_pitfalls=[
                "Proposing moving to a single AZ (sacrificing production SLA and fault tolerance)",
                "Ignoring NAT Gateway processing costs when discussing outbound AWS traffic",
            ],
        ),
        sample_answer=(
            "Cross-AZ data transfer in AWS incurs $0.01 per GB in each direction, which scales rapidly in microservice architectures with high east-west traffic. "
            "To optimize this while maintaining multi-AZ resilience, I implement a three-pillar solution. "
            "First, in Kubernetes, I enable Topology Aware Routing (service.kubernetes.io/topology-mode=auto) and configure "
            "topologySpreadConstraints so client pods prefer communicating with services in the same Availability Zone. "
            "Second, I audit S3 and DynamoDB traffic routed through NAT Gateways, replacing them with free VPC Gateway Endpoints to eliminate data processing fees. "
            "Third, I place in-AZ Read Replicas or local caches for read-heavy dependencies, ensuring cross-AZ calls occur only for cross-zone database replication. "
            "This architecture typically reduces inter-AZ network fees by 60% without compromising 99.99% availability."
        ),
        follow_up_questions=[
            "What are the prerequisites in Kubernetes for Topology Aware Routing to activate safely?",
            "How would you evaluate AWS Savings Plans vs Reserved Instances for steady-state EKS worker nodes?",
        ],
    ),
    Question(
        id="aws-iam-least-privilege-roles",
        title="AWS IAM Least Privilege & IRSA for Kubernetes",
        prompt=(
            "A microservice running in Amazon EKS needs to read and write to an S3 bucket. "
            "How do you design and implement access control following the principle of least privilege without hardcoding long-lived AWS IAM credentials?"
        ),
        role="cloud",
        topic="aws",
        difficulty="mid",
        competencies=[
            "AWS IAM Policies & Roles",
            "IAM Roles for Service Accounts (IRSA)",
            "OIDC Identity Providers",
            "Least Privilege Security",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "IAM Roles for Service Accounts (IRSA)",
                "OIDC Identity Provider (EKS)",
                "AssumeRoleWithWebIdentity",
                "Scoped S3 resource ARN (s3:GetObject, s3:PutObject)",
                "Kubernetes ServiceAccount annotation",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Strictly avoids hardcoded access keys or assigning IAM roles to node instance profiles",
                "Explains the OIDC federation handshake between Kubernetes and AWS STS",
                "Defines a tightly scoped IAM policy restricting actions to the specific bucket ARN",
            ],
            common_pitfalls=[
                "Using 'Resource: *' or 'Action: s3:*' in the IAM policy",
                "Assigning S3 permissions to the EC2 Node IAM Role instead of the pod ServiceAccount",
            ],
        ),
        sample_answer=(
            "To enforce least privilege without long-lived credentials, I configure IAM Roles for Service Accounts (IRSA). "
            "First, I associate an OIDC provider with our EKS cluster in AWS IAM. "
            "Second, I create an IAM policy restricted only to the necessary S3 actions—such as 's3:GetObject' and 's3:PutObject'—scoped "
            "strictly to 'arn:aws:s3:::my-bucket/*' rather than wildcard resources. "
            "Third, I create an IAM Role with a trust policy that permits 'sts:AssumeRoleWithWebIdentity' restricted to the specific "
            "Kubernetes namespace and ServiceAccount name. "
            "Finally, I annotate the Kubernetes ServiceAccount with 'eks.amazonaws.com/role-arn'. "
            "The EKS Pod Identity Webhook automatically injects temporary AWS STS credentials into the pod, which rotate automatically without manual key management."
        ),
        follow_up_questions=[
            "How does EKS Pod Identity (the newer alternative to IRSA introduced in late 2023) simplify role configuration?",
            "How do IAM Permission Boundaries prevent developers from escalating their own privileges?",
        ],
    ),
    Question(
        id="aws-vpc-peering-transit-gateway",
        title="VPC Peering vs AWS Transit Gateway Architecture",
        prompt=(
            "Your company has grown from 3 VPCs to 25 VPCs across multiple AWS accounts, creating a complex mesh of VPC Peering connections. "
            "When would you transition to AWS Transit Gateway, and what are the architectural and cost trade-offs?"
        ),
        role="cloud",
        topic="aws",
        difficulty="mid",
        competencies=[
            "AWS Networking & Hub-and-Spoke",
            "VPC Peering Mesh Complexity",
            "AWS Transit Gateway (TGW)",
            "Cost & Bandwidth Evaluation",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Full-mesh VPC peering scalability (n*(n-1)/2)",
                "Hub-and-spoke topology",
                "Transit Gateway attachments & route tables",
                "TGW hourly fee and data processing fee ($0.02/GB)",
                "Transitive routing support",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Contrasts full-mesh peering routing complexity with central Transit Gateway management",
                "Highlights that VPC Peering has no data processing fee, whereas TGW charges per GB",
                "Explains transitive routing benefits with on-premises Direct Connect / VPN",
            ],
            common_pitfalls=[
                "Ignoring that VPC Peering does NOT support transitive routing",
                "Recommending Transit Gateway without acknowledging the data processing cost increase",
            ],
        ),
        sample_answer=(
            "With 25 VPCs, a full-mesh VPC Peering topology requires 300 individual peering connections, making route tables unmanageable and error-prone. "
            "Furthermore, VPC Peering does not support transitive routing: VPC A cannot talk to VPC C through VPC B. "
            "Transitioning to AWS Transit Gateway (TGW) introduces a hub-and-spoke model where each VPC attaches to a central hub via a single attachment. "
            "TGW supports transitive routing, centralized route tables, and unified integration with on-premises Direct Connect or VPN. "
            "However, the trade-off is cost: VPC Peering has zero hourly or processing fees beyond standard cross-AZ transfer, "
            "whereas Transit Gateway charges $0.05 per attachment-hour plus $0.02 per GB of data processed. "
            "For high-volume point-to-point data transfers, we keep dedicated VPC Peering, while using TGW for general inter-VPC and hybrid connectivity."
        ),
        follow_up_questions=[
            "How do Transit Gateway route tables allow you to isolate development VPCs from production VPCs?",
            "What is AWS Cloud WAN and how does it compare to managing multi-region Transit Gateways?",
        ],
    ),
    Question(
        id="aws-s3-security-bucket-policies",
        title="Hardening S3 Bucket Security & Preventing Data Leaks",
        prompt=(
            "How do you design a comprehensive security posture for sensitive data stored in Amazon S3? "
            "Cover encryption, bucket policies, block public access, and audit logging."
        ),
        role="cloud",
        topic="aws",
        difficulty="junior",
        competencies=[
            "S3 Security Best Practices",
            "KMS Customer Managed Keys (SSE-KMS)",
            "S3 Block Public Access",
            "Bucket Policies & CloudTrail Data Events",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "S3 Block Public Access at account & bucket level",
                "SSE-KMS encryption with key rotation",
                "Bucket policy enforcing aws:SecureTransport (HTTPS)",
                "S3 Object Lock / Versioning for immutability",
                "AWS CloudTrail data events & AWS Macie",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Enforces HTTPS via bucket policy deny rule on aws:SecureTransport",
                "Enables S3 Block Public Access across all 4 settings",
                "Configures KMS encryption and access audit logging",
            ],
            common_pitfalls=[
                "Assuming default encryption with SSE-S3 meets enterprise compliance requirements",
                "Forgetting to enforce TLS/HTTPS in transit via bucket policy",
            ],
        ),
        sample_answer=(
            "Securing sensitive data in Amazon S3 requires a multi-layered defense. "
            "First, I enable 'Block Public Access' across all 4 settings at both the account and bucket levels to prevent accidental public exposure. "
            "Second, I enforce encryption in transit by adding a bucket policy with an explicit Deny for any request where 'aws:SecureTransport' is false, ensuring all calls use TLS. "
            "Third, for encryption at rest, I configure server-side encryption using AWS KMS Customer Managed Keys (SSE-KMS) with annual key rotation, "
            "allowing KMS key policies to provide an additional layer of access control. "
            "Fourth, I enable S3 Versioning and MFA Delete to protect against accidental deletions or ransomware. "
            "Finally, I configure S3 server access logging and enable CloudTrail data events to monitor every GetObject and PutObject call via AWS GuardDuty and Macie."
        ),
        follow_up_questions=[
            "What is the difference between an S3 Bucket Policy and an S3 Access Control List (ACL), and why does AWS recommend disabling ACLs?",
            "How do S3 Lifecycle Policies help balance storage cost with data retention requirements?",
        ],
    ),

    # =========================================================================
    # 5. DOCKER & CONTAINERIZATION
    # =========================================================================
    Question(
        id="docker-multistage-caching",
        title="Docker Multi-Stage Builds & Layer Optimization",
        prompt=(
            "How do you optimize Docker image builds for security and efficiency? "
            "Explain how multi-stage builds and layer caching work in practice."
        ),
        role="devops",
        topic="docker",
        difficulty="junior",
        competencies=[
            "Container Image Best Practices",
            "Dockerfile Layer Optimization",
            "Supply Chain & Container Security",
            "Build Automation Performance",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "multi-stage build",
                "non-root user",
                "layer caching order",
                "distroless or alpine base image",
                ".dockerignore file",
                "minimize image size / attack surface",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Separates build dependencies from runtime image",
                "Enforces non-root execution (USER directive)",
                "Orders instructions to maximize cache hits on dependency layers",
            ],
            common_pitfalls=[
                "Leaving compilers, dev packages, and build tools in the final production image",
                "Running containers as default root user",
            ],
        ),
        sample_answer=(
            "Optimizing Docker images requires minimizing attack surface and maximizing build speed through multi-stage builds and smart layer caching. "
            "In the builder stage, compilers, build dependencies, and SDKs are installed to compile binaries or bundles. "
            "In the final runtime stage, we start from a minimal base like Alpine or Google Distroless, copying only the compiled artifacts from the builder. "
            "This reduces image size from gigabytes to tens of megabytes and removes shell utilities that attackers could exploit. "
            "For security, I always create a dedicated non-root user and group with explicit UID/GID and specify 'USER appuser'. "
            "For layer caching, files that change infrequently—like package.json or requirements.txt—are copied first, followed by dependency installation. "
            "Source code is copied in the final layers, ensuring cache hits on dependency layers during daily code commits."
        ),
        follow_up_questions=[
            "How do you implement image vulnerability scanning in the CI pipeline before pushing to the container registry?",
            "What is the difference between ADD and COPY in a Dockerfile, and when would you prefer one over the other?",
        ],
    ),
    Question(
        id="docker-security-nonroot-distroless",
        title="Container Hardening: Non-Root, Distroless, and Read-Only Filesystems",
        prompt=(
            "A container security audit flags that your containers run with root UID 0, writable root filesystems, and unnecessary package managers. "
            "How do you refactor your Dockerfile and Kubernetes securityContext to remediate these findings?"
        ),
        role="devops",
        topic="docker",
        difficulty="mid",
        competencies=[
            "Container Security Hardening",
            "Distroless Base Images",
            "Kubernetes securityContext",
            "Read-Only Root Filesystems",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "USER 10001:10001 (non-root)",
                "readOnlyRootFilesystem: true",
                "emptyDir mounts for /tmp and /var/run",
                "drop ALL capabilities (drop: ['ALL'])",
                "Google Container Distroless / Chainguard",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Creates unprivileged user and sets explicit non-root USER directive",
                "Configures Kubernetes securityContext with readOnlyRootFilesystem and dropped capabilities",
                "Provides temporary writable volumes via emptyDir mounts for applications requiring temp storage",
            ],
            common_pitfalls=[
                "Assuming non-root inside container makes you completely safe without dropping Linux capabilities",
                "Enabling read-only filesystem without mounting /tmp, breaking applications that write temporary pid or lock files",
            ],
        ),
        sample_answer=(
            "To remediate these findings, I implement container hardening at both the Dockerfile and Kubernetes deployment levels. "
            "In the Dockerfile, I switch the base image to a Distroless or Chainguard image, which contains only the application and its runtime dependencies, "
            "excluding package managers, shells, and curl. "
            "I create a dedicated unprivileged user, such as 'USER 10001:10001', ensuring the process never runs as root. "
            "In Kubernetes, I configure the pod 'securityContext' with: 'runAsNonRoot: true', 'runAsUser: 10001', 'allowPrivilegeEscalation: false', "
            "'readOnlyRootFilesystem: true', and 'capabilities: drop: [\"ALL\"]'. "
            "If the application requires temporary scratch space for logging or PID files, I mount an in-memory 'emptyDir' volume to '/tmp', "
            "keeping the container root filesystem strictly immutable."
        ),
        follow_up_questions=[
            "How do you debug a failing container in production if the Distroless image lacks a shell and curl?",
            "What is the difference between seccomp, AppArmor, and SELinux in container runtime enforcement?",
        ],
    ),
    Question(
        id="docker-zombie-processes-init",
        title="PID 1, Signal Handling, and Zombie Process Reaping in Containers",
        prompt=(
            "When running a Node.js or Python application in a container, issuing 'docker stop' takes 10 seconds before forcefully killing the container with SIGKILL. "
            "Furthermore, child worker processes accumulate as zombies. Why does this happen, and how do you resolve it?"
        ),
        role="devops",
        topic="docker",
        difficulty="senior",
        competencies=[
            "Linux Process Trees & PID 1",
            "Signal Forwarding (SIGTERM, SIGINT, SIGKILL)",
            "Zombie Process Reaping (waitpid)",
            "Init Systems (tini, dumb-init)",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "PID 1 special responsibilities",
                "Signal forwarding to child processes",
                "Zombie process reaping",
                "tini / dumb-init wrapper",
                "CMD ['node', 'index.js'] vs shell form CMD 'node index.js'",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Explains that PID 1 in Linux ignores default signal handlers unless explicitly registered",
                "Identifies that the shell form of CMD creates /bin/sh as PID 1, which does not forward SIGTERM",
                "Recommends using an init system like tini (docker run --init) or exec format",
            ],
            common_pitfalls=[
                "Using shell form (CMD node server.js) instead of exec form (CMD ['node', 'server.js'])",
                "Thinking Docker stop sends SIGKILL immediately instead of waiting for a 10s grace period",
            ],
        ),
        sample_answer=(
            "This problem occurs because the application process is running as PID 1 inside the container's PID namespace. "
            "In Linux, PID 1 has two unique responsibilities: reaping orphaned zombie child processes and handling signals. "
            "By default, the Linux kernel treats PID 1 specially: it does not apply default signal actions. "
            "If the application (like Node.js or Python) does not explicitly register a SIGTERM listener, the signal is ignored. "
            "Docker waits 10 seconds for graceful shutdown before issuing an uncatchable SIGKILL. "
            "Furthermore, if CMD uses shell syntax ('CMD node app.js'), '/bin/sh' becomes PID 1 and fails to forward signals to the node child. "
            "To fix this, first, use exec form: 'CMD [\"node\", \"app.js\"]'. "
            "Second, use a lightweight init process like 'tini' or 'dumb-init' as ENTRYPOINT, or run Docker with the '--init' flag. "
            "The init system properly forwards SIGTERM and reaps orphaned child processes."
        ),
        follow_up_questions=[
            "How does Kubernetes terminationGracePeriodSeconds interact with preStop lifecycle hooks and SIGTERM signals?",
            "What happens to database connections when a container receives SIGKILL instead of handling SIGTERM gracefully?",
        ],
    ),

    # =========================================================================
    # 6. SYSTEM DESIGN & HIGH AVAILABILITY
    # =========================================================================
    Question(
        id="sysdesign-distributed-rate-limiter",
        title="Designing a Distributed API Rate Limiter",
        prompt=(
            "Design a distributed rate limiter for a public REST API that protects backend services from abuse while supporting 50,000 requests per second across multiple regional data centers. Which algorithm and data store would you choose?"
        ),
        role="backend",
        topic="system_design",
        difficulty="senior",
        competencies=[
            "Distributed Systems Architecture",
            "Rate Limiting Algorithms (Token Bucket, Sliding Window)",
            "Redis & In-Memory Stores",
            "Race Conditions & Atomic Operations",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Token Bucket vs Sliding Window Counter",
                "Redis with Lua scripting for atomicity",
                "Local memory tier with distributed sync",
                "HTTP 429 Too Many Requests & Retry-After header",
                "Client identification (API key, IP, JWT claims)",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Selects and justifies Token Bucket or Sliding Window Log/Counter",
                "Addresses concurrency and race conditions using Redis Lua scripts or Redis cell",
                "Discusses latency mitigation through multi-tier local caching and regional clustering",
            ],
            common_pitfalls=[
                "Using relational database queries for high-throughput rate limiting",
                "Ignoring race conditions between checking quota and incrementing counter (check-then-act bug)",
            ],
        ),
        sample_answer=(
            "For a high-throughput distributed rate limiter handling 50,000 RPS, I recommend the Sliding Window Counter algorithm backed by Redis. "
            "Unlike Fixed Window counters that suffer from burst traffic at window boundaries, Sliding Window provides smooth, accurate rate limiting. "
            "To eliminate network latency overhead on every request, I implement a two-tier architecture: an in-memory local cache at the API Gateway layer "
            "with periodic batch synchronization, backed by a distributed Redis cluster. "
            "To prevent race conditions, all check-and-increment operations in Redis execute via an atomic Lua script, ensuring no concurrent requests exceed quota. "
            "When limits are reached, the gateway immediately returns HTTP 429 with standard 'X-RateLimit-Limit', 'X-RateLimit-Remaining', and 'Retry-After' headers. "
            "For regional resilience, each AWS region maintains its own Redis cluster to avoid cross-region latency in the critical request path."
        ),
        follow_up_questions=[
            "How do you handle rate limiter failure—fail open (allow traffic) or fail closed (block traffic)?",
            "How would you differentiate rate limits based on customer tiers (Free, Pro, Enterprise)?",
        ],
    ),
    Question(
        id="sysdesign-idempotent-payment-webhook",
        title="Designing Idempotent Payment Webhook Processing",
        prompt=(
            "Payment providers like Stripe deliver webhook events with at-least-once delivery guarantees, meaning your backend may receive the same event multiple times. "
            "How do you design an idempotent webhook consumer that guarantees customer accounts are never charged or credited twice?"
        ),
        role="backend",
        topic="system_design",
        difficulty="senior",
        competencies=[
            "Distributed Transactions & Idempotency",
            "At-Least-Once Delivery Semantics",
            "Database Unique Constraints & Locks",
            "Cryptographic Webhook Signature Verification",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Idempotency Key / Event ID unique constraint",
                "HMAC signature verification",
                "Database transaction with SELECT FOR UPDATE",
                "Outbox pattern / Event deduplication",
                "Fast HTTP 200 acknowledgment with async queue",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Verifies cryptographic signature before processing payload",
                "Enforces unique database constraint on event ID",
                "Separates synchronous webhook acknowledgment from asynchronous processing",
            ],
            common_pitfalls=[
                "Checking if event exists in code without a database unique constraint (race condition)",
                "Processing payment side-effects synchronously before returning HTTP 200, risking provider timeouts",
            ],
        ),
        sample_answer=(
            "Handling at-least-once webhook delivery requires cryptographic verification, asynchronous queuing, and atomic database deduplication. "
            "First, before parsing the payload, I verify the HMAC-SHA256 signature header using the shared webhook signing secret to prevent spoofing. "
            "Second, the endpoint quickly records the incoming 'event_id' into an 'idempotency_keys' table with a status of 'processing'. "
            "This table has a strict UNIQUE constraint on 'event_id'. If an insert throws a unique constraint violation, we immediately return HTTP 200 to acknowledge receipt and discard the duplicate. "
            "Third, the webhook handler returns HTTP 200 within 200ms and enqueues the event to a reliable queue for background processing. "
            "The worker wraps the business logic—such as updating customer account balance—in a database transaction, updating the event status to 'completed'. "
            "This ensures exactly-once business execution despite repeated provider deliveries."
        ),
        follow_up_questions=[
            "What happens if the background worker crashes midway through processing an event?",
            "How do you handle webhook event ordering when events arrive out of chronological order?",
        ],
    ),
    Question(
        id="sysdesign-database-read-replicas-lag",
        title="Database Read Replicas & Replication Lag Mitigation",
        prompt=(
            "To scale a read-heavy relational database, you introduce read replicas. "
            "Immediately, users complain that right after updating their user profile, the page reloads showing old data. "
            "Explain read-after-write inconsistency and the architectural techniques used to mitigate replication lag."
        ),
        role="backend",
        topic="system_design",
        difficulty="mid",
        competencies=[
            "Database Replication (Asynchronous vs Synchronous)",
            "Read-After-Write Consistency (Read-Your-Writes)",
            "Connection Routing & Read/Write Splitting",
            "Caching and Monotonic Reads",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Asynchronous replication lag",
                "Read-your-writes consistency",
                "Primary / Leader vs Replica / Follower",
                "Sticky routing based on user session or timestamp",
                "WAL (Write-Ahead Log) position tracking",
            ],
            star_method_applicable=False,
            evaluation_criteria=[
                "Explains the cause: asynchronous replication lag between primary and replica",
                "Proposes routing the immediate post-write read to the Primary database",
                "Discusses session-based or time-windowed (e.g. 5 seconds) sticky routing to primary",
            ],
            common_pitfalls=[
                "Suggesting switching to fully synchronous replication for all replicas (severely impairs write latency)",
                "Blaming browser cache instead of database replication lag",
            ],
        ),
        sample_answer=(
            "This issue is caused by read-after-write inconsistency due to asynchronous replication lag between the primary database and read replicas. "
            "When a user submits a profile update, the write commits to the primary instance. When the page reloads, the read query is directed to a replica "
            "that has not yet applied the Write-Ahead Log (WAL) changes, displaying stale data. "
            "To solve this while preserving the read-scaling benefits of replicas, I implement 'read-your-writes' consistency. "
            "First, the API framework tracks writes per user session: if a user performed a write within the last 5 seconds, all subsequent reads for that user "
            "are temporarily pinned to the primary database. "
            "Second, for critical endpoints, we track the commit LSN (Log Sequence Number) or timestamp, ensuring the chosen replica has caught up before reading. "
            "Third, general read traffic from other users continues reading from replicas, maintaining high throughput without confusing the editing user."
        ),
        follow_up_questions=[
            "How does PostgreSQL logical replication differ from streaming physical replication?",
            "What is connection pooling (e.g., PgBouncer), and why is it critical when scaling multiple read replicas?",
        ],
    ),

    # =========================================================================
    # 7. BEHAVIORAL INTERVIEWS (STAR METHOD)
    # =========================================================================
    Question(
        id="behavioral-production-outage",
        title="Managing a Critical Outage & Stakeholder Communication",
        prompt=(
            "Tell me about a time when a production incident occurred during a critical business event or demo. "
            "How did you manage technical resolution and stakeholder communication?"
        ),
        role="devops",
        topic="behavioral",
        difficulty="mid",
        competencies=[
            "Production Incident Management",
            "Executive & Stakeholder Communication",
            "Blameless Postmortems & Root Cause Analysis",
            "STAR Method Execution",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Situation: Context of high-stakes event",
                "Task: Responsibility as Incident Commander or Lead",
                "Action: Fast mitigation over perfection, communication cadence",
                "Result: Recovery metrics, customer impact, systemic prevention",
            ],
            star_method_applicable=True,
            evaluation_criteria=[
                "Strict adherence to STAR structure (Situation, Task, Action, Result)",
                "Balances technical triage with clear stakeholder updates",
                "Concludes with measurable outcomes and postmortem improvements",
            ],
            common_pitfalls=[
                "Focusing entirely on technical debugging while neglecting stakeholder communication",
                "Assigning blame to individuals instead of identifying systemic process gaps",
            ],
        ),
        sample_answer=(
            "[Situation] During a high-stakes customer executive demo at my previous company, our core authentication service experienced a sudden outage due to database connection pool exhaustion triggered by an unindexed query. "
            "[Task] As the on-call DevOps engineer, my responsibility was twofold: quickly mitigate the customer-facing impact and maintain transparent communication with the sales engineering team in the demo room. "
            "[Action] I immediately established an incident call, assigned myself Incident Commander, and notified stakeholders via a dedicated Slack bridge with 10-minute cadence updates. "
            "On the technical side, rather than debugging the slow query live, I executed a fast rollback to the prior stable release and temporarily doubled the read-replica connection pool. "
            "[Result] The service recovered within 7 minutes, enabling the demo to conclude successfully. "
            "Afterward, I authored a blameless postmortem, implemented automated query latency alerts, and added strict connection pool thresholds to our staging integration tests."
        ),
        follow_up_questions=[
            "Looking back at that incident, what is one thing you would do differently if a similar outage occurred tomorrow?",
            "How did you help the team re-establish stakeholder confidence after the incident concluded?",
        ],
    ),
    Question(
        id="behavioral-technical-disagreement",
        title="Resolving a Technical Disagreement on Architecture",
        prompt=(
            "Describe a situation where you had a strong technical disagreement with a team lead or architect regarding an engineering decision. "
            "How did you handle the discussion, and what was the outcome?"
        ),
        role="devops",
        topic="behavioral",
        difficulty="senior",
        competencies=[
            "Constructive Conflict Resolution",
            "Data-Driven Technical Advocacy",
            "Collaboration & Team Alignment",
            "Disagree and Commit Mentality",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Situation: The architectural conflict (e.g., K8s vs Serverless, Monolith vs Microservices)",
                "Task: Need to reach consensus without damaging team morale",
                "Action: Prototyping, benchmarking data, presenting trade-offs objectively",
                "Result: Successful delivery and alignment on decision",
            ],
            star_method_applicable=True,
            evaluation_criteria=[
                "Focuses on data, benchmarks, and business impact rather than personal opinions",
                "Demonstrates emotional intelligence and active listening",
                "Shows willingness to 'disagree and commit' if the final decision differs",
            ],
            common_pitfalls=[
                "Presenting oneself as having won an argument against an incompetent colleague",
                "Failing to present objective data or POC results",
            ],
        ),
        sample_answer=(
            "[Situation] When architecting our new data pipeline, our team lead proposed deploying a multi-broker Apache Kafka cluster, while I believed AWS SQS and SNS were significantly better suited for our initial traffic volume of 200 messages per minute. "
            "[Task] My objective was to prevent unnecessary operational complexity and infrastructure costs without escalating interpersonal tension or delaying the roadmap. "
            "[Action] Instead of debating hypothetically in meetings, I built a quick Proof of Concept comparing both solutions. "
            "I drafted a 1-page Architecture Decision Record (ADR) detailing maintenance overhead, patching requirements, operational costs, and latency SLAs. "
            "I presented the findings collaboratively to the lead, acknowledging Kafka's superior throughput for future scale but demonstrating that SQS eliminated on-call operational toil today. "
            "[Result] The team lead agreed with the data-driven proposal, saving an estimated $2,500 monthly in cluster costs and reducing our delivery timeline by three weeks. "
            "We agreed on specific traffic threshold triggers where transitioning to Kafka would be re-evaluated."
        ),
        follow_up_questions=[
            "What would you have done if the team lead insisted on Kafka despite your benchmark data?",
            "How do you maintain a positive working relationship with a colleague after an intense technical disagreement?",
        ],
    ),
    Question(
        id="behavioral-tight-deadline-tradeoffs",
        title="Managing Technical Debt Under Tight Deadlines",
        prompt=(
            "Tell me about a project where you were forced to make compromises on code quality, testing, or infrastructure to meet an aggressive deadline. "
            "How did you manage the technical debt afterward?"
        ),
        role="backend",
        topic="behavioral",
        difficulty="mid",
        competencies=[
            "Pragmatic Engineering & Trade-offs",
            "Technical Debt Management",
            "Risk Assessment & Communication",
            "Prioritization Under Pressure",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Situation: Urgent business deadline or compliance requirement",
                "Task: Balancing time-to-market with operational risk",
                "Action: Conscious trade-offs, documenting debt, post-launch sprint",
                "Result: On-time delivery and subsequent remediation",
            ],
            star_method_applicable=True,
            evaluation_criteria=[
                "Demonstrates pragmatic understanding that perfect engineering must align with business reality",
                "Shows deliberate tracking of shortcuts rather than forgetting them after release",
                "Secures dedicated engineering time to pay down the technical debt",
            ],
            common_pitfalls=[
                "Claiming never to have cut corners or compromised on engineering quality",
                "Abandoning technical debt permanently, resulting in long-term instability",
            ],
        ),
        sample_answer=(
            "[Situation] Our engineering team was given a rigid three-week deadline to launch an analytics ingestion service for a major retail customer partner during Black Friday. "
            "[Task] With limited time, I knew we could not build a fully automated horizontal auto-scaler and complete end-to-end load test matrix before the launch date. "
            "[Action] I met with the product manager and proposed a deliberate trade-off: we would over-provision static ECS Fargate capacity to ensure headroom and implement basic retry queues, "
            "deferring complex autoscaling algorithms and automated load testing. "
            "Crucially, I created explicit Jira tech-debt tickets, added synthetic alerts for queue depth, and negotiated with leadership that the first sprint in January would be dedicated to debt remediation. "
            "[Result] The partner launched successfully on Black Friday with zero dropped events and 99.98% uptime. "
            "In January, as scheduled, we implemented proper auto-scaling policies, right-sized the cluster, and reduced our infrastructure bill by 45%."
        ),
        follow_up_questions=[
            "How do you convince product managers and non-technical stakeholders to prioritize tech debt tickets over new feature requests?",
            "What criteria do you use to decide which shortcuts are acceptable and which are too risky to take?",
        ],
    ),
    Question(
        id="behavioral-mentoring-junior-engineer",
        title="Mentoring a Struggling Engineer & Leveling Up the Team",
        prompt=(
            "Describe a time when you coached or mentored a junior engineer or new hire who was struggling to adapt to your team's codebase and delivery standards. "
            "What approach did you take, and what was the outcome?"
        ),
        role="devops",
        topic="behavioral",
        difficulty="mid",
        competencies=[
            "Mentorship & Technical Leadership",
            "Empathy & Active Listening",
            "Knowledge Sharing & Documentation",
            "Continuous Improvement",
        ],
        rubric=QuestionRubric(
            key_concepts=[
                "Situation: Identifying the root cause of the struggles",
                "Task: Commitment to support the engineer's growth",
                "Action: Pair programming, breaking down tasks, psychological safety",
                "Result: Independent contributor, improved team documentation",
            ],
            star_method_applicable=True,
            evaluation_criteria=[
                "Diagnoses specific bottlenecks (e.g., poor onboarding docs, complex tooling, lack of feedback)",
                "Shows patience, structured guidance, and measurable milestones",
                "Creates systemic improvements (updating onboarding guides) so future hires benefit",
            ],
            common_pitfalls=[
                "Blaming the junior engineer for lack of experience or motivation",
                "Doing the work for them instead of coaching them to independence",
            ],
        ),
        sample_answer=(
            "[Situation] A newly hired junior DevOps engineer was struggling with our Terraform and Kubernetes deployment pipeline, consistently taking twice as long on sprint tasks and feeling overwhelmed during code reviews. "
            "[Task] As their assigned mentor, my goal was to build their technical confidence, clarify our architectural standards, and help them become an independent, productive contributor. "
            "[Action] I set up bi-weekly 1-on-1 check-ins and dedicated two hours each week to collaborative pair programming. "
            "I quickly discovered that our internal onboarding documentation had outdated instructions, which was causing their confusion. "
            "Together, we updated the developer setup guide. I broke their upcoming feature tickets into smaller, iterative milestones and encouraged them to ask questions in public Slack channels without fear of judgment. "
            "[Result] Within two months, the engineer was independently managing infrastructure deployments and even took ownership of our Terraform module upgrade project. "
            "The refreshed onboarding guide reduced subsequent new hire ramp-up time by 40%."
        ),
        follow_up_questions=[
            "How do you balance time spent mentoring team members with your own individual delivery responsibilities?",
            "What indicators tell you that an engineer has successfully transitioned from needing guidance to working independently?",
        ],
    ),
]


class QuestionCatalog:
    """In-memory question repository for DevSpeak AI."""

    def __init__(self, questions: list[Question] | None = None) -> None:
        self._questions = {q.id: q for q in (questions or DEVOPS_QUESTIONS)}

    def count(self) -> int:
        """Return total number of questions loaded in catalog."""
        return len(self._questions)

    def list_questions(
        self,
        role: RoleCategory | None = None,
        topic: Topic | None = None,
        difficulty: Difficulty | None = None,
    ) -> QuestionListResponse:
        """Filter questions by role, topic, and difficulty."""
        filtered = list(self._questions.values())

        if role:
            filtered = [q for q in filtered if q.role == role]
        if topic:
            filtered = [q for q in filtered if q.topic == topic]
        if difficulty:
            filtered = [q for q in filtered if q.difficulty == difficulty]

        summaries = [
            QuestionSummary(
                id=q.id,
                title=q.title,
                prompt=q.prompt,
                role=q.role,
                topic=q.topic,
                difficulty=q.difficulty,
                competencies=q.competencies,
            )
            for q in filtered
        ]

        return QuestionListResponse(total=len(summaries), items=summaries)

    def get_question(self, question_id: str) -> Question | None:
        """Retrieve complete question with rubric and sample answer by ID."""
        return self._questions.get(question_id)


_catalog_instance = QuestionCatalog()


def get_question_catalog() -> QuestionCatalog:
    """Dependency provider for question catalog."""
    return _catalog_instance
