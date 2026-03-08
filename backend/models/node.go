package models

import (
	"context"
	"strings"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Node struct {
	Name            string   `json:"name"`
	OS              string   `json:"os"`
	Status          string   `json:"status"`
	IP              string   `json:"ip"`
	Hostname        string   `json:"hostname"`
	Roles           []string `json:"roles"`
	CRI             string   `json:"cri"`
	KubeletVersion  string   `json:"kubelet_version"`
	TotalPodCount   int      `json:"pod_count"`
	RunningPodCount int      `json:"running"`
	OthersPodCount  int      `json:"others"`
}

func GetNodes(clientset *kubernetes.Clientset) ([]Node, error) {
	nodes, err := clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	podCountByNode, err := PodCountsByNode(clientset)
	if err != nil {
		return nil, err
	}
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

		newNode := Node{
			Name:            node.Name,
			OS:              node.Status.NodeInfo.OSImage,
			Status:          Status,
			IP:              InternalIP,
			Hostname:        Hostname,
			Roles:           roles,
			CRI:             node.Status.NodeInfo.ContainerRuntimeVersion,
			KubeletVersion:  node.Status.NodeInfo.KubeletVersion,
			TotalPodCount:   podCountByNode[node.Name]["total"],
			RunningPodCount: podCountByNode[node.Name]["running"],
			OthersPodCount:  podCountByNode[node.Name]["others"],
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
				return "NotReady", nil
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

func PodCountsByNode(clientset *kubernetes.Clientset) (map[string]map[string]int, error) {

	podList, err := clientset.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {

		return nil, err
	}

	podCountsByNode := make(map[string]map[string]int)

	for _, p := range podList.Items {

		if p.Spec.NodeName != "" {
			if podCountsByNode[p.Spec.NodeName] == nil {
				podCountsByNode[p.Spec.NodeName] = make(map[string]int)
			}
			podCountsByNode[p.Spec.NodeName]["total"]++
			if GetPodStatus(p) == "Running" {
				podCountsByNode[p.Spec.NodeName]["running"]++
			} else {
				podCountsByNode[p.Spec.NodeName]["others"]++
			}
		}
	}

	return podCountsByNode, nil
}
