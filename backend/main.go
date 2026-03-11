package main

import (
	"kube-vision-backend/api"
	"log"
	"net/http"

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

	log.Println("Server is starting port 8080...")
	err = http.ListenAndServe(":8080", router)
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
