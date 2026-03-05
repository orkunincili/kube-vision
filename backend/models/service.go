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
	CLusterIP  string `json:"cluster_ip"`
	ExternalIP string `json:"external_ip"`
}

func GetServices(clientset *kubernetes.Clientset, ns string) ([]Service, error) {
	Services, err := clientset.CoreV1().Services(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Service
	for _, service := range Services.Items {
		ClusterIP, ExternalIP, err := GetIP(service)
		if err != nil {
			return nil, err
		}
		Ports, err := GetPorts(service)
		if err != nil {
			return nil, err
		}
		NewSvc := Service{
			Name:       service.Name,
			Namespace:  service.Namespace,
			Type:       string(service.Spec.Type),
			CLusterIP:  ClusterIP,
			ExternalIP: ExternalIP,
			Ports:      Ports,
		}
		result = append(result, NewSvc)

	}
	return result, nil
}
func GetPorts(svc v1.Service) (string, error) {
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

	return strings.Join(allPorts, ", "), nil

}
func GetIP(svc v1.Service) (string, string, error) {

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

	return svc.Spec.ClusterIP, externalIP, nil

}
