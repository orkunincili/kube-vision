package models

import (
	"reflect"
	"strings"

	"fmt"
	corev1 "k8s.io/api/core/v1"
)

type Service struct {
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
	Type       string `json:"type"`
	Ports      string `json:"ports"`
	ClusterIP  string `json:"cluster_ip"`
	ExternalIP string `json:"external_ip"`
}

func BuildService(service *corev1.Service) Service {
	clusterIP, externalIP := GetIP(service)
	ports := GetPorts(service)

	return Service{
		Name:       service.Name,
		Namespace:  service.Namespace,
		Type:       string(service.Spec.Type),
		ClusterIP:  clusterIP,
		ExternalIP: externalIP,
		Ports:      ports,
	}
}

func EqualService(oldService, newService *corev1.Service) bool {
	return reflect.DeepEqual(BuildService(oldService), BuildService(newService))
}

func GetPorts(svc *corev1.Service) string {
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

func GetIP(svc *corev1.Service) (string, string) {
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
