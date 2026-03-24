package store

import (
	"kube-vision-backend/models"
)

type Summary struct {
	Nodes          []models.Node  `json:"node"`
	PodCount       int            `json:"pod_count"`
	PodStatus      map[string]int `json:"pod_status"`
	ServiceCount   int            `json:"service_count"`
	IngressCount   int            `json:"ingress_count"`
	ConfigMapCount int            `json:"configmap_count"`
}

func GetClusterSummary(store *ClusterStore) Summary {
	nodes, _ := store.Get("nodes").([]models.Node)
	pods, _ := store.Get("pods").([]models.Pod)
	services, _ := store.Get("services").([]models.Service)
	ingresses, _ := store.Get("ingresses").([]models.Ingress)
	configMaps, _ := store.Get("configmaps").([]models.ConfigMap)

	podStatus := make(map[string]int)
	for _, pod := range pods {
		podStatus[pod.Status]++
	}

	return Summary{
		Nodes:          nodes,
		PodCount:       len(pods),
		PodStatus:      podStatus,
		ServiceCount:   len(services),
		IngressCount:   len(ingresses),
		ConfigMapCount: len(configMaps),
	}
}
