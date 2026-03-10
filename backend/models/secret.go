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

func GetSecret(clientset *kubernetes.Clientset, ns string) ([]Secret, error) {

	secrets, err := clientset.CoreV1().Secrets(ns).List(context.TODO(), metav1.ListOptions{})

	if err != nil {
		return nil, err
	}

	var result []Secret

	for _, secret := range secrets.Items {
		age, err := GetAge(secret.CreationTimestamp)
		if err != nil {
			return nil, err
		}

		newSecret := Secret{
			Name:      secret.Name,
			Namespace: secret.Namespace,
			DataKeys:  slices.Collect(maps.Keys(secret.Data)),
			Type:      string(secret.Type),
			Age:       age,
		}
		result = append(result, newSecret)
	}
	return result, nil
}
