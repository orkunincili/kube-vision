package api

import (
	"kube-vision-backend/store"
	"net/http"
)

func SetupRoutes(clusterStore *store.ClusterStore) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/healthz", handleHealthz())
	mux.HandleFunc("/api/v1/summary", handleCluster(clusterStore))
	mux.HandleFunc("/api/v1/nodes", handleNodes(clusterStore))
	mux.HandleFunc("/api/v1/pods", handlePods(clusterStore))
	mux.HandleFunc("/api/v1/services", handleServices(clusterStore))
	mux.HandleFunc("/api/v1/deployments", handleDeployment(clusterStore))
	mux.HandleFunc("/api/v1/ingresses", handleIngresses(clusterStore))
	mux.HandleFunc("/api/v1/configmaps", handleConfigMap(clusterStore))

	return mux
}
