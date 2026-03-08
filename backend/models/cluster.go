package models

import (
	"context"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Cluster struct {
	Nodes        []Node         `json:"node"`
	PodCount     int            `json:"pod_count"`
	PodStatus    map[string]int `json:"pod_status"`
	ServiceCount int            `json:"service_count"`
	IngressCount int            `json:"ingress_count"`
}

func GetClusterSummary(clientset *kubernetes.Clientset, ns string) (*Cluster, error) {
	// 1. Nodes
	nodes, err := GetNodes(clientset)
	if err != nil {
		return nil, fmt.Errorf("nodes hatası: %w", err)
	}

	// 2. Services
	serviceCount, err := GetResourceCount(clientset, "", "service")
	if err != nil {
		return nil, fmt.Errorf("service count hatası: %w", err)
	}

	// 3. Ingresses
	ingressCount, err := GetResourceCount(clientset, "", "ingress")
	if err != nil {
		return nil, fmt.Errorf("ingress count hatası: %w", err)
	}

	// 4. Pods (Hata kontrolünü List'ten hemen sonra yap!)
	Pods, err := clientset.CoreV1().Pods(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("pods listeleme hatası: %w", err)
	}

	// Artık Pods'un nil olmadığından eminiz, döngüye girebiliriz
	podStatus := make(map[string]int)
	for _, pod := range Pods.Items {
		podStatus[GetPodStatus(pod)]++
	}

	summary := &Cluster{
		Nodes:        nodes,
		PodCount:     len(Pods.Items),
		PodStatus:    podStatus,
		ServiceCount: serviceCount,
		IngressCount: ingressCount,
	}

	return summary, nil
}

func GetResourceCount(clientset *kubernetes.Clientset, ns string, resource string) (int, error) {
	ctx := context.TODO()
	opts := metav1.ListOptions{}

	if resource == "service" {
		list, err := clientset.CoreV1().Services(ns).List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(list.Items), nil
	}

	if resource == "ingress" {

		list, err := clientset.NetworkingV1().Ingresses(ns).List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(list.Items), nil
	}

	if resource == "pod" {
		list, err := clientset.CoreV1().Pods(ns).List(ctx, opts)
		if err != nil {
			return 0, err
		}
		return len(list.Items), nil
	}

	return 0, fmt.Errorf("Unknown resource type: %s", resource)
}
