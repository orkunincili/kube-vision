package models

import (
	"log"
	"strconv"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func GetAge(CreationTimestamp metav1.Time) (string, error) {

	duration := time.Since(CreationTimestamp.Time)

	if duration.Hours() > 24 {
		days := int(duration.Hours() / 24)
		return strconv.Itoa(days) + "d", nil
	}
	return duration.Round(time.Second).String(), nil
}

func GetClusterConfig() *rest.Config {
	config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		log.Fatalf("Config error: %v", err)
	}
	return config
}
