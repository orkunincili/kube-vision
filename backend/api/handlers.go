package api

import (
	"kube-vision-backend/cache"
	"kube-vision-backend/models"
	"net/http"
	"time"

	"k8s.io/client-go/kubernetes"
)

const requestTimeout = 5 * time.Second

var globalCache = cache.NewResponseCache()

func handleHealthz() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		renderJSON(w, "ok")
	}
}
func handleCluster(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		cluster, err := models.GetClusterSummary(ctx, cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, cluster)
	}
}

func handleNodes(cs *kubernetes.Clientset) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		nodes, err := models.GetNodes(ctx, cs)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, nodes)
	}
}
func handlePods(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		pods, err := models.GetPods(ctx, cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, pods)
	}
}
func handleServices(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		cacheKey := "services"
		ttl := 60 * time.Second
		renderCachedJSON(w, cacheKey, ttl, func() (interface{}, error) {
			return models.GetServices(ctx, cs, ns)
		})
	}
}
func handleIngresses(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		cacheKey := "ingresses"
		ttl := 60 * time.Second
		renderCachedJSON(w, cacheKey, ttl, func() (interface{}, error) {
			return models.GetIngresses(ctx, cs, ns)
		})
	}
}

func handleDeployment(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		cacheKey := "deployments"
		ttl := 60 * time.Second
		renderCachedJSON(w, cacheKey, ttl, func() (interface{}, error) {
			return models.GetDeployments(ctx, cs, ns)
		})
	}
}

func handleConfigMap(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ctx, cancel := newRequestContext(r.Context())
		defer cancel()
		cacheKey := "configmaps"
		ttl := 60 * time.Second
		renderCachedJSON(w, cacheKey, ttl, func() (interface{}, error) {
			return models.GetConfigMap(ctx, cs, ns)
		})
	}
}
