package models

import (
	"reflect"
	"slices"
	"strings"

	corev1 "k8s.io/api/core/v1"
)

type Node struct {
	Name           string                    `json:"name"`
	OS             string                    `json:"os"`
	Status         string                    `json:"status"`
	IP             string                    `json:"ip"`
	Hostname       string                    `json:"hostname"`
	Roles          []string                  `json:"roles"`
	CRI            string                    `json:"cri"`
	KubeletVersion string                    `json:"kubelet_version"`
	NodePodStats   map[string]map[string]int `json:"node_pod_stats"`
	CpuUsage       int                       `json:"cpu_usage_percent"`
	MemUsage       int                       `json:"mem_usage_percent"`
}

func BuildNode(node *corev1.Node, nodePodStats map[string]map[string]int) Node {
	status := GetStatus(node)
	hostname, internalIP := GetIPAndHostname(node)
	roles := GetNodeRoles(node)

	return Node{
		Name:           node.Name,
		OS:             node.Status.NodeInfo.OSImage,
		Status:         status,
		IP:             internalIP,
		Hostname:       hostname,
		Roles:          roles,
		CRI:            node.Status.NodeInfo.ContainerRuntimeVersion,
		KubeletVersion: node.Status.NodeInfo.KubeletVersion,
		NodePodStats:   nodePodStats,
	}
}

func EqualNode(oldNode, newNode *corev1.Node, nodePodStats map[string]map[string]int) bool {
	return reflect.DeepEqual(BuildNode(oldNode, nodePodStats), BuildNode(newNode, nodePodStats))
}

func GetIPAndHostname(node *corev1.Node) (string, string) {
	var hostname, internalIP string

	for _, addr := range node.Status.Addresses {
		switch addr.Type {
		case "Hostname":
			hostname = addr.Address
		case "InternalIP":
			internalIP = addr.Address
		}
	}
	return hostname, internalIP
}

func GetStatus(node *corev1.Node) string {
	for _, condition := range node.Status.Conditions {
		if condition.Type == "Ready" {
			if condition.Status == "True" {
				return "Ready"
			}
			return "NotReady"
		}
	}

	return "Unknown"
}

func GetNodeRoles(node *corev1.Node) []string {
	roles := []string{}

	for label := range node.Labels {
		if strings.HasPrefix(label, "node-role.kubernetes.io/") {
			role := strings.Split(label, "/")[1]
			roles = append(roles, role)
		}
	}

	if len(roles) == 0 {
		roles = append(roles, "None")
	}

	slices.Sort(roles)
	return roles
}
