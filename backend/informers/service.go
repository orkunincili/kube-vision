package informers

import (
	"fmt"
	"kube-vision-backend/models"
	"kube-vision-backend/store"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/tools/cache"
)

func RegisterServiceInformer(informer cache.SharedIndexInformer, clusterStore *store.ClusterStore) {
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			service := obj.(*corev1.Service)
			data := models.BuildService(service)
			clusterStore.Update("service", data)
			fmt.Printf("Yeni service eklendi ve Store'a yazildi: %s\n", data.Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldService := oldObj.(*corev1.Service)
			newService := newObj.(*corev1.Service)
			if models.EqualService(oldService, newService) {
				return
			}

			data := models.BuildService(newService)
			clusterStore.Update("service", data)
			fmt.Printf("Service guncellendi: %s/%s\n", data.Namespace, data.Name)
		},
		DeleteFunc: func(obj interface{}) {
			service := obj.(*corev1.Service)
			clusterStore.Delete("service", service.Namespace, service.Name)
			fmt.Printf("Service silindi: %s\n", service.Name)
		},
	})
}
