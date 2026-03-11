package models

import (
	"context"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Cluster struct {
	Nodes          []Node         `json:"node"`
	PodCount       int            `json:"pod_count"`
	PodStatus      map[string]int `json:"pod_status"`
	ServiceCount   int            `json:"service_count"`
	IngressCount   int            `json:"ingress_count"`
	ConfigMapCount int            `json:"configmap_count"`
	SecretCount    int            `json:"secret_count"`
}

func GetClusterSummary(
	ctx context.Context,
	clientset *kubernetes.Clientset,
	ns string,
) (*Cluster, error) {

	nodes, err := GetNodes(ctx, clientset)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch nodes: %w", err)
	}

	pods, err := clientset.CoreV1().Pods(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	serviceCount, err := clientset.CoreV1().Services(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %w", err)
	}

	ingressCount, err := clientset.NetworkingV1().Ingresses(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list ingresses: %w", err)
	}

	configMapCount, err := clientset.CoreV1().ConfigMaps(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list configmaps: %w", err)
	}

	secretCount, err := clientset.CoreV1().Secrets(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list secrets: %w", err)
	}

	podStatus := make(map[string]int)
	for _, pod := range pods.Items {
		podStatus[GetPodStatus(pod)]++
	}

	summary := &Cluster{
		Nodes:          nodes,
		PodCount:       len(pods.Items),
		PodStatus:      podStatus,
		ServiceCount:   len(serviceCount.Items),
		IngressCount:   len(ingressCount.Items),
		ConfigMapCount: len(configMapCount.Items),
		SecretCount:    len(secretCount.Items),
	}

	return summary, nil
}
