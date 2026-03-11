package models

import (
	"context"
	"maps"
	"slices"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type Secret struct {
	Name      string   `json:"name"`
	Namespace string   `json:"namespace"`
	DataKeys  []string `json:"data_keys"`
	Type      string   `json:"type"`
	Age       string   `json:"age"`
}

func GetSecret(ctx context.Context, clientset *kubernetes.Clientset, ns string) ([]Secret, error) {

	secrets, err := clientset.CoreV1().Secrets(ns).List(ctx, metav1.ListOptions{})

	if err != nil {
		return nil, err
	}

	var result []Secret

	for _, s := range secrets.Items {
		age, err := GetAge(s.CreationTimestamp)
		if err != nil {
			return nil, err
		}

		newSecret := Secret{
			Name:      s.Name,
			Namespace: s.Namespace,
			DataKeys:  slices.Collect(maps.Keys(s.Data)),
			Type:      string(s.Type),
			Age:       age,
		}
		result = append(result, newSecret)
	}
	return result, nil
}
