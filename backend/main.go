package main

import (
	"encoding/json"
	"fmt"
	"kube-vision-backend/models" // Kendi modül adınla değiştir
	"log"
	"net/http"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

// Yazdırma işlemini kolaylaştıran yardımcı fonksiyon
func printJSON(title string, v interface{}) {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		log.Printf("%s marshall hatası: %v", title, err)
		return
	}
	fmt.Printf("\n=== %s ===\n", title)
	fmt.Println(string(data))
}

func main() {
	// 1. Kubeconfig ve Clientset kurulumu
	config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		log.Fatalf("Kubeconfig hatası: %v", err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.Write([]byte("ok"))
	})
	http.HandleFunc("/nodes", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		nodes, err := models.GetNodes(clientset)
		if err != nil {
			http.Error(w, "failed to get nodes", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if err := json.NewEncoder(w).Encode(nodes); err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
			return
		}

	})
	http.HandleFunc("/pods", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		namespace := r.URL.Query().Get("namespace")
		pods, err := models.GetPods(clientset, namespace)
		if err != nil {
			http.Error(w, "failed to get pods", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if err := json.NewEncoder(w).Encode(pods); err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
			return
		}

	})
	http.HandleFunc("/deployments", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		namespace := r.URL.Query().Get("namespace")
		deployments, err := models.GetDeployments(clientset, namespace)
		if err != nil {
			http.Error(w, "failed to get deployments", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if err := json.NewEncoder(w).Encode(deployments); err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
			return
		}

	})
	http.HandleFunc("/services", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		namespace := r.URL.Query().Get("namespace")
		services, err := models.GetServices(clientset, namespace)
		if err != nil {
			http.Error(w, "failed to get services", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if err := json.NewEncoder(w).Encode(services); err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
			return
		}

	})
	http.HandleFunc("/ingresses", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		namespace := r.URL.Query().Get("namespace")
		ingresses, err := models.GetIngresses(clientset, namespace)
		if err != nil {
			http.Error(w, "failed to get ingresses", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if err := json.NewEncoder(w).Encode(ingresses); err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
			return
		}

	})
	http.HandleFunc("/summary", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		namespace := r.URL.Query().Get("namespace")
		ingresses, err := models.GetClusterSummary(clientset, namespace)
		if err != nil {
			http.Error(w, "failed to get cluster info", http.StatusInternalServerError)
			fmt.Print(err)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		if err := json.NewEncoder(w).Encode(ingresses); err != nil {
			http.Error(w, "failed to encode json", http.StatusInternalServerError)
			return
		}

	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
