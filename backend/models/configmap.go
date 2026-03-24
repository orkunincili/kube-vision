package models

import (
	"maps"
	"reflect"
	"slices"

	corev1 "k8s.io/api/core/v1"
)

type ConfigMap struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	DataKeys  []string          `json:"data_keys"`
	Labels    map[string]string `json:"labels"`
	Age       string            `json:"age"`
}

func BuildConfigMap(cm *corev1.ConfigMap) ConfigMap {
	dataKeys := slices.Collect(maps.Keys(cm.Data))
	slices.Sort(dataKeys)

	return ConfigMap{
		Name:      cm.Name,
		Namespace: cm.Namespace,
		DataKeys:  dataKeys,
		Labels:    maps.Clone(cm.Labels),
		Age:       GetAge(cm.CreationTimestamp),
	}
}

func EqualConfigMap(oldConfigMap, newConfigMap *corev1.ConfigMap) bool {
	return reflect.DeepEqual(BuildConfigMap(oldConfigMap), BuildConfigMap(newConfigMap))
}
