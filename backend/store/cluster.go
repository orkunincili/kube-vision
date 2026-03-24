package store

import (
	"fmt"
	"kube-vision-backend/models"
	"sync"
)

type ClusterStore struct {
	mu          sync.RWMutex
	Pods        map[string]models.Pod
	Deployments map[string]models.Deployment
	Services    map[string]models.Service
	Ingresses   map[string]models.Ingress
	Nodes       map[string]models.Node
	ConfigMaps  map[string]models.ConfigMap
}

func NewClusterStore() *ClusterStore {
	return &ClusterStore{
		Pods:        make(map[string]models.Pod),
		Deployments: make(map[string]models.Deployment),
		Services:    make(map[string]models.Service),
		Ingresses:   make(map[string]models.Ingress),
		Nodes:       make(map[string]models.Node),
		ConfigMaps:  make(map[string]models.ConfigMap),
	}
}

func (s *ClusterStore) Get(resourceType string) interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	switch resourceType {

	case "nodes":
		nodes := make([]models.Node, 0, len(s.Nodes))
		for _, n := range s.Nodes {
			nodes = append(nodes, n)
		}
		return nodes
	case "pods":
		pods := make([]models.Pod, 0, len(s.Pods))
		for _, p := range s.Pods {
			pods = append(pods, p)
		}
		return pods
	case "deployments":
		deploys := make([]models.Deployment, 0, len(s.Deployments))
		for _, d := range s.Deployments {
			deploys = append(deploys, d)
		}
		return deploys
	case "services":
		services := make([]models.Service, 0, len(s.Services))
		for _, svc := range s.Services {
			services = append(services, svc)
		}
		return services
	case "ingresses":
		ingresses := make([]models.Ingress, 0, len(s.Ingresses))
		for _, i := range s.Ingresses {
			ingresses = append(ingresses, i)
		}
		return ingresses
	case "configmaps":
		configmaps := make([]models.ConfigMap, 0, len(s.ConfigMaps))
		for _, c := range s.ConfigMaps {
			configmaps = append(configmaps, c)
		}
		return configmaps
	default:
		fmt.Printf("Uyari: %s tipi icin henuz bir handler yazilmamis.\n", resourceType)
		return nil
	}
}

func (s *ClusterStore) Update(resourceType string, obj interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()

	switch resourceType {
	case "node":
		if node, ok := obj.(models.Node); ok {
			key := node.Name
			s.Nodes[key] = node
			fmt.Println("Node guncellendi:", key)
		}
	case "pod":
		if pod, ok := obj.(models.Pod); ok {
			key := fmt.Sprintf("%s/%s", pod.Namespace, pod.Name)
			s.Pods[key] = pod
			fmt.Println("Pod guncellendi:", key)
		}
	case "deployment":
		if deploy, ok := obj.(models.Deployment); ok {
			key := fmt.Sprintf("%s/%s", deploy.Namespace, deploy.Name)
			s.Deployments[key] = deploy
			fmt.Println("Deployment guncellendi:", key)
		}
	case "service":
		if svc, ok := obj.(models.Service); ok {
			key := fmt.Sprintf("%s/%s", svc.Namespace, svc.Name)
			s.Services[key] = svc
			fmt.Println("Service guncellendi:", key)
		}
	case "ingress":
		if ing, ok := obj.(models.Ingress); ok {
			key := fmt.Sprintf("%s/%s", ing.Namespace, ing.Name)
			s.Ingresses[key] = ing
			fmt.Println("Ingress guncellendi:", key)
		}
	case "configmap":
		if cm, ok := obj.(models.ConfigMap); ok {
			key := fmt.Sprintf("%s/%s", cm.Namespace, cm.Name)
			s.ConfigMaps[key] = cm
			fmt.Println("ConfigMap guncellendi:", key)
		}
	default:
		fmt.Printf("Uyari: %s tipi icin henuz bir handler yazilmamis.\n", resourceType)
	}
}

func (s *ClusterStore) Delete(resourceType string, namespace, name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := fmt.Sprintf("%s/%s", namespace, name)
	switch resourceType {
	case "node":
		delete(s.Nodes, name)
	case "pod":
		delete(s.Pods, key)
	case "deployment":
		delete(s.Deployments, key)
	case "service":
		delete(s.Services, key)
	case "ingress":
		delete(s.Ingresses, key)
	case "configmap":
		delete(s.ConfigMaps, key)
	default:
		fmt.Printf("Uyari: %s tipi icin henuz bir handler yazilmamis.\n", resourceType)
	}
}

func (s *ClusterStore) GetPodCountsByNode() map[string]map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	nodeStats := make(map[string]map[string]int)
	for _, p := range s.Pods {
		if p.NodeName == "" {
			continue
		}

		if _, exists := nodeStats[p.NodeName]; !exists {
			nodeStats[p.NodeName] = map[string]int{
				"total":   0,
				"running": 0,
				"others":  0,
			}
		}

		nodeStats[p.NodeName]["total"]++
		if p.Status == "Running" {
			nodeStats[p.NodeName]["running"]++
		} else {
			nodeStats[p.NodeName]["others"]++
		}
	}

	return nodeStats
}
