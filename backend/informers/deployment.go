package informers

import (
	"fmt"
	"kube-vision-backend/models"
	"kube-vision-backend/store"

	appsv1 "k8s.io/api/apps/v1"
	"k8s.io/client-go/tools/cache"
)

func RegisterDeploymentInformer(informer cache.SharedIndexInformer, clusterStore *store.ClusterStore) {
	informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			deployment := obj.(*appsv1.Deployment)
			data := models.BuildDeployment(deployment)
			clusterStore.Update("deployment", data)
			fmt.Printf("Yeni deployment eklendi ve Store'a yazildi: %s\n", data.Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			oldDeployment := oldObj.(*appsv1.Deployment)
			newDeployment := newObj.(*appsv1.Deployment)
			if models.EqualDeployment(oldDeployment, newDeployment) {
				return
			}

			data := models.BuildDeployment(newDeployment)
			clusterStore.Update("deployment", data)
			fmt.Printf("Deployment guncellendi: %s/%s\n", data.Namespace, data.Name)
		},
		DeleteFunc: func(obj interface{}) {
			deployment := obj.(*appsv1.Deployment)
			clusterStore.Delete("deployment", deployment.Namespace, deployment.Name)
			fmt.Printf("Deployment silindi: %s\n", deployment.Name)
		},
	})
}
