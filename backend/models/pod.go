package models

import (
	"reflect"

	corev1 "k8s.io/api/core/v1"
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

func BuildPod(pod *corev1.Pod) Pod {
	return Pod{
		Name:            pod.Name,
		Namespace:       pod.Namespace,
		Status:          GetPodStatus(pod),
		HostIP:          pod.Status.HostIP,
		Containers:      len(pod.Spec.Containers),
		ReadyContainers: GetPodContainerStatus(pod),
		NodeName:        pod.Spec.NodeName,
		Age:             GetAge(pod.CreationTimestamp),
	}
}

func EqualPod(oldPod, newPod *corev1.Pod) bool {
	return reflect.DeepEqual(BuildPod(oldPod), BuildPod(newPod))
}

func GetPodContainerStatus(pod *corev1.Pod) int {
	readyContainers := 0
	for _, containerStatus := range pod.Status.ContainerStatuses {
		if containerStatus.Ready {
			readyContainers++
		}
	}
	return readyContainers
}

func GetPodStatus(pod *corev1.Pod) string {
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
