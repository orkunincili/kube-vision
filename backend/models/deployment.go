package models

import (
	"reflect"

	appsv1 "k8s.io/api/apps/v1"
)

type Deployment struct {
	Name            string `json:"name"`
	Namespace       string `json:"namespace"`
	DesiredReplicas int32  `json:"desired_replicas"`
	ReadyReplicas   int32  `json:"ready_replicas"`
	Available       int32  `json:"available_replicas"`
}

func BuildDeployment(deploy *appsv1.Deployment) Deployment {
	var desired int32
	if deploy.Spec.Replicas != nil {
		desired = *deploy.Spec.Replicas
	}

	return Deployment{
		Name:            deploy.Name,
		Namespace:       deploy.Namespace,
		DesiredReplicas: desired,
		ReadyReplicas:   deploy.Status.ReadyReplicas,
		Available:       deploy.Status.AvailableReplicas,
	}
}

func EqualDeployment(oldDeploy, newDeploy *appsv1.Deployment) bool {
	return reflect.DeepEqual(BuildDeployment(oldDeploy), BuildDeployment(newDeploy))
}
