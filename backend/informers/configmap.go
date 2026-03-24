package informers

import (
	"fmt"
	"kube-vision-backend/models"
	"kube-vision-backend/store"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/tools/cache"
)

func RegisterConfigMapInformer(informer cache.SharedIndexInformer, clusterStore *store.ClusterStore) {
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			configMap := obj.(*corev1.ConfigMap)
			data := models.BuildConfigMap(configMap)
			clusterStore.Update("configmap", data)
			fmt.Printf("Yeni configmap eklendi ve Store'a yazildi: %s\n", data.Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldConfigMap := oldObj.(*corev1.ConfigMap)
			newConfigMap := newObj.(*corev1.ConfigMap)
			if models.EqualConfigMap(oldConfigMap, newConfigMap) {
				return
			}

			data := models.BuildConfigMap(newConfigMap)
			clusterStore.Update("configmap", data)
			fmt.Printf("ConfigMap guncellendi: %s/%s\n", data.Namespace, data.Name)
		},
		DeleteFunc: func(obj interface{}) {
			configMap := obj.(*corev1.ConfigMap)
			clusterStore.Delete("configmap", configMap.Namespace, configMap.Name)
			fmt.Printf("ConfigMap silindi: %s\n", configMap.Name)
		},
	})
}
