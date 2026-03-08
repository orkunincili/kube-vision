package models

import (
	"context"
	"strconv"
	"time"

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

func GetPods(clientset *kubernetes.Clientset, ns string) ([]Pod, error) {
	Pods, err := clientset.CoreV1().Pods(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Pod

	for _, pod := range Pods.Items {
		readyContainers, err := GetPodContainerStatus(pod)
		podAge, err := GetPodAge(pod.CreationTimestamp)
		if err != nil {
			return nil, err
		}
		NewPod := Pod{
			Name:            pod.Name,
			Namespace:       pod.Namespace,
			Status:          GetPodStatus(pod),
			HostIP:          pod.Status.HostIP,
			Containers:      len(pod.Spec.Containers),
			ReadyContainers: readyContainers,
			NodeName:        pod.Spec.NodeName,
			Age:             podAge,
		}
		result = append(result, NewPod)
	}
	return result, nil
}

func GetPodContainerStatus(pod v1.Pod) (int, error) {
	readyContainers := 0
	for _, containerStatus := range pod.Status.ContainerStatuses {
		if containerStatus.Ready {
			readyContainers++
		}
	}
	return readyContainers, nil
}

func GetPodAge(CreationTimestamp metav1.Time) (string, error) {

	duration := time.Since(CreationTimestamp.Time)

	if duration.Hours() > 24 {
		days := int(duration.Hours() / 24)
		return strconv.Itoa(days) + "d", nil
	}
	return duration.Round(time.Second).String(), nil
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
