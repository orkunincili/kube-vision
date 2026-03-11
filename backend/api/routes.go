package api

import (
	"net/http"

	"k8s.io/client-go/kubernetes"
)

func SetupRoutes(clientset *kubernetes.Clientset, ns string) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", handleHealthz())
	mux.HandleFunc("/summary", handleCluster(clientset, ns))
	mux.HandleFunc("/nodes", handleNodes(clientset))
	mux.HandleFunc("/pods", handlePods(clientset, ns))
	mux.HandleFunc("/services", handleServices(clientset, ns))
	mux.HandleFunc("/deployments", handleDeployment(clientset, ns))
	mux.HandleFunc("/ingresses", handleIngresses(clientset, ns))
	mux.HandleFunc("/configmaps", handleConfigMap(clientset, ns))
	return mux
}
