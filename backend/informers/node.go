package informers

import (
	"fmt"
	"kube-vision-backend/models"
	"kube-vision-backend/store"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/tools/cache"
)

func RegisterNodeInformer(informer cache.SharedIndexInformer, clusterStore *store.ClusterStore) {
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			node := obj.(*corev1.Node)
			podStats := clusterStore.GetPodCountsByNode()
			data := models.BuildNode(node, podStats)
			clusterStore.Update("node", data)
			fmt.Printf("Yeni node eklendi ve Store'a yazildi: %s\n", data.Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldNode := oldObj.(*corev1.Node)
			newNode := newObj.(*corev1.Node)
			podStats := clusterStore.GetPodCountsByNode()
			if models.EqualNode(oldNode, newNode, podStats) {
				return
			}

			data := models.BuildNode(newNode, podStats)
			clusterStore.Update("node", data)
			fmt.Printf("Node guncellendi: %s\n", data.Name)
		},
		DeleteFunc: func(obj interface{}) {
			node := obj.(*corev1.Node)
			clusterStore.Delete("node", node.Namespace, node.Name)
			fmt.Printf("Node silindi: %s\n", node.Name)
		},
	})
}
