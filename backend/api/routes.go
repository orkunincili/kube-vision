package api

import (
	"net/http"
	"time"

	"k8s.io/client-go/kubernetes"
)

func SetupRoutes(clientset *kubernetes.Clientset, ns string) *http.ServeMux {
	globalCache.StartCleanup(1 * time.Hour)
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/healthz", handleHealthz())
	mux.HandleFunc("/api/v1/summary", handleCluster(clientset, ns))
	mux.HandleFunc("/api/v1/nodes", handleNodes(clientset))
	mux.HandleFunc("/api/v1/pods", handlePods(clientset, ns))
	mux.HandleFunc("/api/v1/services", handleServices(clientset, ns))
	mux.HandleFunc("/api/v1/deployments", handleDeployment(clientset, ns))
	mux.HandleFunc("/api/v1/ingresses", handleIngresses(clientset, ns))
	mux.HandleFunc("/api/v1/configmaps", handleConfigMap(clientset, ns))
	return mux
}
