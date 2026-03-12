package main

import (
	"kube-vision-backend/api"
	"log"
	"net/http"
	"os"

	"k8s.io/client-go/rest"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {

	config, err := loadKubeConfig()
	if err != nil {
		log.Fatalf("Failed to load Kubernetes config: %v", err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatal(err)
	}

	router := api.SetupRoutes(clientset, "")

	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	log.Printf("Server is starting on %s...", addr)
	err = http.ListenAndServe(addr, router)
	if err != nil {
		log.Fatal(err)
	}
}

func loadKubeConfig() (*rest.Config, error) {
	config, err := rest.InClusterConfig()
	if err == nil {
		log.Println("Using in-cluster Kubernetes config")
		return config, nil
	}

	config, err = clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		return nil, err
	}

	log.Println("Using local kubeconfig")
	return config, nil
}
