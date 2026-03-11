package models

import (
	"context"
	"maps"
	"slices"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type ConfigMap struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	DataKeys  []string          `json:"data_keys"`
	Labels    map[string]string `json:"labels"`
	Age       string            `json:"age"`
}

func GetConfigMap(ctx context.Context, clientset *kubernetes.Clientset, ns string) ([]ConfigMap, error) {

	cms, err := clientset.CoreV1().ConfigMaps(ns).List(ctx, metav1.ListOptions{})

	if err != nil {
		return nil, err
	}

	var result []ConfigMap

	for _, cm := range cms.Items {
		age, err := GetAge(cm.CreationTimestamp)
		if err != nil {
			return nil, err
		}

		newConfigMap := ConfigMap{
			Name:      cm.Name,
			Namespace: cm.Namespace,
			DataKeys:  slices.Collect(maps.Keys(cm.Data)),
			Labels:    cm.Labels,
			Age:       age,
		}
		result = append(result, newConfigMap)
	}
	return result, nil
}
