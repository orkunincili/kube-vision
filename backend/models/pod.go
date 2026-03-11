package models

import (
	"context"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Pod struct {
	Name            string `json:"name"`
	Namespace       string `json:"namespace"`
	Status          string `json:"status"`
	HostIP          string `json:"host_ip"`
	Containers      int    `json:"containers"`
	ReadyContainers int    `json:"ready_containers"`
	NodeName        string `json:"node_name"`
	Age             string `json:"age"`
}

func GetPods(ctx context.Context, clientset *kubernetes.Clientset, ns string) ([]Pod, error) {
	pods, err := clientset.CoreV1().Pods(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Pod

	for _, p := range pods.Items {
		readyContainers := GetPodContainerStatus(p)
		podAge, err := GetAge(p.CreationTimestamp)
		if err != nil {
			return nil, err
		}
		newPod := Pod{
			Name:            p.Name,
			Namespace:       p.Namespace,
			Status:          GetPodStatus(p),
			HostIP:          p.Status.HostIP,
			Containers:      len(p.Spec.Containers),
			ReadyContainers: readyContainers,
			NodeName:        p.Spec.NodeName,
			Age:             podAge,
		}
		result = append(result, newPod)
	}
	return result, nil
}

func GetPodContainerStatus(pod v1.Pod) int {
	readyContainers := 0
	for _, containerStatus := range pod.Status.ContainerStatuses {
		if containerStatus.Ready {
			readyContainers++
		}
	}
	return readyContainers
}

func GetPodStatus(pod v1.Pod) string {

	if pod.DeletionTimestamp != nil {
		return "Terminating"
	}

	for _, containerStatus := range pod.Status.ContainerStatuses {
		if containerStatus.State.Waiting != nil {

			return containerStatus.State.Waiting.Reason
		}
		if containerStatus.State.Terminated != nil {
			return containerStatus.State.Terminated.Reason
		}
	}

	return string(pod.Status.Phase)
}
