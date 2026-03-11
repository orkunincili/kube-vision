package models

import (
	"context"
	"fmt"
	"strings"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Service struct {
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
	Type       string `json:"type"`
	Ports      string `json:"ports"`
	ClusterIP  string `json:"cluster_ip"`
	ExternalIP string `json:"external_ip"`
}

func GetServices(ctx context.Context, clientset *kubernetes.Clientset, ns string) ([]Service, error) {
	services, err := clientset.CoreV1().Services(ns).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Service
	for _, s := range services.Items {
		clusterIP, externalIP := GetIP(s)
		ports := GetPorts(s)
		newService := Service{
			Name:       s.Name,
			Namespace:  s.Namespace,
			Type:       string(s.Spec.Type),
			ClusterIP:  clusterIP,
			ExternalIP: externalIP,
			Ports:      ports,
		}
		result = append(result, newService)

	}
	return result, nil
}
func GetPorts(svc v1.Service) string {
	var allPorts []string

	for _, port := range svc.Spec.Ports {
		var current string
		if svc.Spec.Type == "LoadBalancer" || svc.Spec.Type == "NodePort" {
			current = fmt.Sprintf("%d:%d:%s", port.Port, port.NodePort, port.TargetPort.String())
		} else {
			current = fmt.Sprintf("%d:%s", port.Port, port.TargetPort.String())
		}

		allPorts = append(allPorts, current)
	}

	return strings.Join(allPorts, ", ")

}
func GetIP(svc v1.Service) (string, string) {

	externalIP := "None"
	if svc.Spec.Type == "LoadBalancer" {
		for _, ingress := range svc.Status.LoadBalancer.Ingress {
			if externalIP == "None" {
				externalIP = ingress.IP
			} else {
				externalIP += ", " + ingress.IP
			}
		}

	}

	return svc.Spec.ClusterIP, externalIP

}
