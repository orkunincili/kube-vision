package api

import (
	"context"
	"kube-vision-backend/models"
	"net/http"
	"time"

	"k8s.io/client-go/kubernetes"
)

const requestTimeout = 5 * time.Second

func newRequestContext(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, requestTimeout)
}

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
		services, err := models.GetServices(ctx, cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, services)
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
		ingresses, err := models.GetIngresses(ctx, cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, ingresses)
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
		deployments, err := models.GetDeployments(ctx, cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, deployments)
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
		cms, err := models.GetConfigMap(ctx, cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderJSON(w, cms)
	}
}
