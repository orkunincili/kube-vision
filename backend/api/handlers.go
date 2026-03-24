package api

import (
	"kube-vision-backend/store"
	"net/http"
)

func handleHealthz() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, map[string]string{"status": "ok"})
	}
}

func handleCluster(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, store.GetClusterSummary(clusterStore))
	}
}

func handleNodes(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, clusterStore.Get("nodes"))
	}
}

func handlePods(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, clusterStore.Get("pods"))
	}
}

func handleServices(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, clusterStore.Get("services"))
	}
}

func handleIngresses(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, clusterStore.Get("ingresses"))
	}
}

func handleDeployment(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, clusterStore.Get("deployments"))
	}
}

func handleConfigMap(clusterStore *store.ClusterStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, clusterStore.Get("configmaps"))
	}
}
