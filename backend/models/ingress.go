package models

import (
	"reflect"

	networkingv1 "k8s.io/api/networking/v1"
)

type Ingress struct {
	Name          string   `json:"name"`
	Namespace     string   `json:"namespace"`
	Hosts         []string `json:"hosts"`
	Endpoints     []string `json:"endpoints"`
	AddressSource string   `json:"address_source"`
}

func BuildIngress(ingress *networkingv1.Ingress) Ingress {
	source, endpoints, hosts := ExtractIngressInfo(ingress)

	return Ingress{
		Name:          ingress.Name,
		Namespace:     ingress.Namespace,
		Hosts:         hosts,
		Endpoints:     endpoints,
		AddressSource: source,
	}
}

func EqualIngress(oldIngress, newIngress *networkingv1.Ingress) bool {
	return reflect.DeepEqual(BuildIngress(oldIngress), BuildIngress(newIngress))
}

func ExtractIngressInfo(i *networkingv1.Ingress) (string, []string, []string) {
	var hosts []string
	for _, r := range i.Spec.Rules {
		if r.Host != "" {
			hosts = append(hosts, r.Host)
		}
	}

	var endpoints []string
	source := "Pending/None"

	for _, lb := range i.Status.LoadBalancer.Ingress {
		if lb.IP != "" {
			endpoints = append(endpoints, lb.IP)
			source = "LoadBalancer"
		} else if lb.Hostname != "" {
			endpoints = append(endpoints, lb.Hostname)
			source = "LoadBalancer"
		}
	}

	return source, endpoints, hosts
}
