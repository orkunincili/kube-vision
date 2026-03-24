package main

import (
	appinformers "kube-vision-backend/informers"
	"kube-vision-backend/store"
	"log"
	"os"
	"os/signal"
	"syscall"

	k8sinformers "k8s.io/client-go/informers"
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

	clusterStore := store.NewClusterStore()
	factory := k8sinformers.NewSharedInformerFactory(clientset, 0)

	podInformer := factory.Core().V1().Pods().Informer()
	nodeInformer := factory.Core().V1().Nodes().Informer()
	serviceInformer := factory.Core().V1().Services().Informer()
	configMapInformer := factory.Core().V1().ConfigMaps().Informer()
	deploymentInformer := factory.Apps().V1().Deployments().Informer()
	ingressInformer := factory.Networking().V1().Ingresses().Informer()

	appinformers.RegisterPodInformer(podInformer, clusterStore)
	appinformers.RegisterNodeInformer(nodeInformer, clusterStore)
	appinformers.RegisterServiceInformer(serviceInformer, clusterStore)
	appinformers.RegisterConfigMapInformer(configMapInformer, clusterStore)
	appinformers.RegisterDeploymentInformer(deploymentInformer, clusterStore)
	appinformers.RegisterIngressInformer(ingressInformer, clusterStore)

	stopCh := make(chan struct{})
	defer close(stopCh)

	factory.Start(stopCh)

	if !cache.WaitForCacheSync(
		stopCh,
		podInformer.HasSynced,
		nodeInformer.HasSynced,
		serviceInformer.HasSynced,
		configMapInformer.HasSynced,
		deploymentInformer.HasSynced,
		ingressInformer.HasSynced,
	) {
		log.Fatal("cache sync basarisiz")
	}

	log.Println("Informer'lar calisiyor. Cikmak icin Ctrl+C.")

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	<-sigCh
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
