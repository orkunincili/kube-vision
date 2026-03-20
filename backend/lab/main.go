package main

import (
	"fmt"
	"log"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"
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

	factory := informers.NewSharedInformerFactory(clientset, 1*time.Second)

	podInformer := factory.Core().V1().Pods().Informer()

	podInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			pod := obj.(*corev1.Pod)
			fmt.Printf("[ADD]    %s/%s phase=%s\n", pod.Namespace, pod.Name, pod.Status.Phase)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldPod := oldObj.(*corev1.Pod)
			newPod := newObj.(*corev1.Pod)

			// gereksiz update spam azaltmak için phase değişimi kontrolü
			if oldPod.ResourceVersion == newPod.ResourceVersion {
				return
			}

			fmt.Printf(
				"[UPDATE] %s/%s phase: %s -> %s\n",
				newPod.Namespace,
				newPod.Name,
				oldPod.Status.Phase,
				newPod.Status.Phase,
			)
		},
		DeleteFunc: func(obj interface{}) {
			pod := obj.(*corev1.Pod)
			fmt.Printf("[DELETE] %s/%s\n", pod.Namespace, pod.Name)
		},
	})

	stopCh := make(chan struct{})
	defer close(stopCh)

	factory.Start(stopCh)

	// informer cache senkron olana kadar bekle
	if !cache.WaitForCacheSync(stopCh, podInformer.HasSynced) {
		log.Fatal("cache sync basarisiz")
	}

	fmt.Println("Informer calisiyor. Cikmak icin Ctrl+C.")
	<-stopCh
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
