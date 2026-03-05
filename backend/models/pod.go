package models

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Pod struct {
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
	Status     string `json:"status"`
	HostIP     string `json:"host_ip"`
	Containers int    `json:"containers"`
}

func GetPods(clientset *kubernetes.Clientset, ns string) ([]Pod, error) {
	Pods, err := clientset.CoreV1().Pods(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Pod
	for _, pod := range Pods.Items {
		NewPod := Pod{
			Name:       pod.Name,
			Namespace:  pod.Namespace,
			Status:     string(pod.Status.Phase),
			HostIP:     pod.Status.HostIP,
			Containers: len(pod.Spec.Containers),
		}
		result = append(result, NewPod)
	}
	return result, nil
}
