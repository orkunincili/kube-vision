package models

import (
	"context"
	"strings"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Node struct {
	Name           string   `json:"name"`
	OS             string   `json:"os"`
	Status         string   `json:"status"`
	IP             string   `json:"ip"`
	Hostname       string   `json:"hostname"`
	Roles          []string `json:"roles"`
	CRI            string   `json:"cri"`
	KubeletVersion string   `json:"kubelet_version"`
	PodCount       int      `json:"pod_count"`
}

func GetNodes(clientset *kubernetes.Clientset) ([]Node, error) {
	nodes, err := clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}
	var result []Node
	for _, node := range nodes.Items {
		Status, err := GetStatus(node)
		if err != nil {
			return nil, err
		}
		Hostname, InternalIP, err := GetIPAndHostname(node)
		if err != nil {
			return nil, err
		}
		roles := GetNodeRoles(node)
		podCount, err := GetNodePodCount(clientset, node.Name)
		if err != nil {
			return nil, err
		}
		newNode := Node{
			Name:           node.Name,
			OS:             node.Status.NodeInfo.OSImage,
			Status:         Status,
			IP:             InternalIP,
			Hostname:       Hostname,
			Roles:          roles,
			CRI:            node.Status.NodeInfo.ContainerRuntimeVersion,
			KubeletVersion: node.Status.NodeInfo.KubeletVersion,
			PodCount:       podCount,
		}
		result = append(result, newNode)
	}
	return result, nil
}
func GetIPAndHostname(node v1.Node) (string, string, error) {
	var hostname, internalIP string

	for _, addr := range node.Status.Addresses {
		switch addr.Type {
		case "Hostname":
			hostname = addr.Address
		case "InternalIP":
			internalIP = addr.Address
		}
	}
	return hostname, internalIP, nil
}
func GetStatus(node v1.Node) (string, error) {

	for _, condition := range node.Status.Conditions {

		if condition.Type == "Ready" {
			if condition.Status == "True" {
				return "Ready", nil
			} else {
				return "Not Ready", nil
			}
		}
	}

	return "Unknown", nil

}
func GetNodeRoles(node v1.Node) []string {
	roles := []string{}

	for label := range node.Labels {

		if strings.HasPrefix(label, "node-role.kubernetes.io/") {
			role := strings.Split(label, "/")[1]
			roles = append(roles, role)
		}
	}

	if len(roles) == 0 {
		roles = append(roles, "worker")
		return roles
	}

	return roles
}
func GetNodePodCount(clientset *kubernetes.Clientset, nodeName string) (int, error) {

	options := metav1.ListOptions{
		FieldSelector: "spec.nodeName=" + nodeName,
	}

	podList, err := clientset.CoreV1().Pods("").List(context.TODO(), options)
	if err != nil {
		return 0, err
	}

	return len(podList.Items), nil
}
