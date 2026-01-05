# Deployment Guide

## Docker Deployment

### Build Images

```bash
# Build backend
docker build -f deploy/Dockerfile.backend -t quantumflow/backend:latest .

# Build frontend
docker build -f deploy/Dockerfile.frontend -t quantumflow/frontend:latest .
```

### Run with Docker Compose

```bash
docker-compose -f deploy/docker-compose.yml up -d
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.28+)
- kubectl configured
- Ingress controller (nginx recommended)
- cert-manager (for TLS)

### Deploy

```bash
# Apply all resources
kubectl apply -k deploy/kubernetes/

# Or apply individually
kubectl apply -f deploy/kubernetes/namespace.yaml
kubectl apply -f deploy/kubernetes/configmap.yaml
kubectl apply -f deploy/kubernetes/secret.yaml
kubectl apply -f deploy/kubernetes/pvc.yaml
kubectl apply -f deploy/kubernetes/backend-deployment.yaml
kubectl apply -f deploy/kubernetes/frontend-deployment.yaml
kubectl apply -f deploy/kubernetes/backend-service.yaml
kubectl apply -f deploy/kubernetes/frontend-service.yaml
kubectl apply -f deploy/kubernetes/ingress.yaml
kubectl apply -f deploy/kubernetes/hpa.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n quantumflow

# Check services
kubectl get svc -n quantumflow

# Check ingress
kubectl get ingress -n quantumflow

# View logs
kubectl logs -f deployment/quantumflow-backend -n quantumflow
```

### Update Secrets

```bash
# Edit secret
kubectl edit secret quantumflow-secrets -n quantumflow

# Or create from file
kubectl create secret generic quantumflow-secrets \
  --from-literal=SECRET_KEY=your-secret-key \
  --from-literal=CIRQ_API_KEY=your-key \
  -n quantumflow \
  --dry-run=client -o yaml | kubectl apply -f -
```

## CI/CD

The project includes GitHub Actions workflows for:
- Continuous Integration (CI)
- Continuous Deployment (CD)

See `.github/workflows/` for details.

