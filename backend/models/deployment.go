package models

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Deployment struct {
	Name            string `json:"name"`
	Namespace       string `json:"namespace"`
	DesiredReplicas int32  `json:"desired_replicas"`
	ReadyReplicas   int32  `json:"ready_replicas"`
	Available       int32  `json:"available_replicas"`
}

func GetDeployments(clientset *kubernetes.Clientset, ns string) ([]Deployment, error) {

	deps, err := clientset.AppsV1().Deployments(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Deployment
	for _, d := range deps.Items {
		var desired int32
		if d.Spec.Replicas != nil {
			desired = *d.Spec.Replicas
		}

		newDep := Deployment{
			Name:            d.Name,
			Namespace:       d.Namespace,
			DesiredReplicas: desired,
			ReadyReplicas:   d.Status.ReadyReplicas,
			Available:       d.Status.AvailableReplicas,
		}
		result = append(result, newDep)
	}
	return result, nil
}
