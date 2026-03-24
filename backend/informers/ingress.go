package informers

import (
	"fmt"
	"kube-vision-backend/models"
	"kube-vision-backend/store"

	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/client-go/tools/cache"
)

func RegisterIngressInformer(informer cache.SharedIndexInformer, clusterStore *store.ClusterStore) {
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			ingress := obj.(*networkingv1.Ingress)
			data := models.BuildIngress(ingress)
			clusterStore.Update("ingress", data)
			fmt.Printf("Yeni ingress eklendi ve Store'a yazildi: %s\n", data.Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldIngress := oldObj.(*networkingv1.Ingress)
			newIngress := newObj.(*networkingv1.Ingress)
			if models.EqualIngress(oldIngress, newIngress) {
				return
			}

			data := models.BuildIngress(newIngress)
			clusterStore.Update("ingress", data)
			fmt.Printf("Ingress guncellendi: %s/%s\n", data.Namespace, data.Name)
		},
		DeleteFunc: func(obj interface{}) {
			ingress := obj.(*networkingv1.Ingress)
			clusterStore.Delete("ingress", ingress.Namespace, ingress.Name)
			fmt.Printf("Ingress silindi: %s\n", ingress.Name)
		},
	})
}
