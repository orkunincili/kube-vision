package api

import (
	"kube-vision-backend/models"
	"net/http"

	"k8s.io/client-go/kubernetes"
)

func handleHealthz() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, "ok")
	}
}
func handleCluster(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		cluster, err := models.GetClusterSummary(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, cluster)
	}
}

func handleNodes(cs *kubernetes.Clientset) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		nodes, err := models.GetNodes(cs)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, nodes)
	}
}
func handlePods(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		pods, err := models.GetPods(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, pods)
	}
}
func handleServices(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		services, err := models.GetServices(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, services)
	}
}
func handleIngresses(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		ingresses, err := models.GetIngresses(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, ingresses)
	}
}

func handleDeployment(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		deployments, err := models.GetDeployments(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, deployments)
	}
}

func handleConfigMap(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		cms, err := models.GetConfigMap(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, cms)
	}
}

func handleSecret(cs *kubernetes.Clientset, ns string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. İsteği doğrula
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// 2. Mutfaktan (models/service) veriyi iste
		// BURASI SENİN OBJELERİ ALDIĞIN YER
		secrets, err := models.GetSecret(cs, ns)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 3. Tabakla (JSON olarak sun)
		renderJSON(w, secrets)
	}
}
