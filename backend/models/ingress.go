package models

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Ingress struct {
	Name          string   `json:"name"`
	Namespace     string   `json:"namespace"`
	Hosts         []string `json:"hosts"`
	Endpoints     []string `json:"endpoints"`
	AddressSource string   `json:"address_source"`
}

func GetIngresses(clientset *kubernetes.Clientset, ns string) ([]Ingress, error) {
	ingList, err := clientset.NetworkingV1().Ingresses(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []Ingress
	for _, i := range ingList.Items {
		var hosts []string
		for _, r := range i.Spec.Rules {
			if r.Host != "" {
				hosts = append(hosts, r.Host)
			}
		}

		var endpoints []string
		source := "Pending/None" // Varsayılan durum

		// Sadece gerçek LoadBalancer verisi varsa dolduruyoruz
		for _, lb := range i.Status.LoadBalancer.Ingress {
			if lb.IP != "" {
				endpoints = append(endpoints, lb.IP)
				source = "LoadBalancer"
			} else if lb.Hostname != "" {
				endpoints = append(endpoints, lb.Hostname)
				source = "LoadBalancer"
			}
		}

		result = append(result, Ingress{
			Name:          i.Name,
			Namespace:     i.Namespace,
			Hosts:         hosts,
			Endpoints:     endpoints,
			AddressSource: source,
		})
	}

	return result, nil
}
