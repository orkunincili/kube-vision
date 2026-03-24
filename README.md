# ☸️ Kube-Vision

[![Go Version](https://img.shields.io/badge/Go-1.25.0-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-In--Development-orange)]()

**Kube-Vision** is a basic and developing Kubernetes dashboard designed for personal use and Golang learning.


## 🛠️ Installation & Setup
```
kubectl apply -f https://raw.githubusercontent.com/orkunincili/kube-vision/refs/heads/development/kube-vision-base.yaml
```
You can access the ingress and httproute examples from the example-routes directory.
## 🛠️ Development 

Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites
- A valid `~/.kube/config` file to access your Kubernetes cluster.
- **Go** (1.25.0 recommended)
- **Node.js** (20.x or later recommended for Next.js 16)
- **pnpm** or **npm**

### 2. Run the Backend (Go)
The backend interacts with the Kubernetes API to fetch live data.
```bash
cd backend
go mod tidy
go run main.go
```

### 3. Run the Frontend (Next.js)
The frontend provides a modern web interface to visualize your cluster data.
```bash
cd frontend
pnpm install   # Install dependencies
pnpm run dev   # Start development server
```
