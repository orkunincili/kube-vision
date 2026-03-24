package informers

import (
	"fmt"
	"kube-vision-backend/models"
	"kube-vision-backend/store"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/tools/cache"
)

func RegisterPodInformer(informer cache.SharedIndexInformer, clusterStore *store.ClusterStore) {
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			pod := obj.(*corev1.Pod)
			data := models.BuildPod(pod)
			clusterStore.Update("pod", data)
			fmt.Printf("Yeni Pod eklendi ve Store'a yazildi: %s\n", data.Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldPod := oldObj.(*corev1.Pod)
			newPod := newObj.(*corev1.Pod)
			if models.EqualPod(oldPod, newPod) {
				return
			}

			data := models.BuildPod(newPod)
			clusterStore.Update("pod", data)
			fmt.Printf("Pod guncellendi: %s/%s\n", data.Namespace, data.Name)
		},
		DeleteFunc: func(obj interface{}) {
			pod := obj.(*corev1.Pod)
			clusterStore.Delete("pod", pod.Namespace, pod.Name)
			fmt.Printf("Pod silindi: %s\n", pod.Name)
		},
	})
}
