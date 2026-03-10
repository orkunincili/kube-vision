package models

import (
	"strconv"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func GetAge(CreationTimestamp metav1.Time) (string, error) {

	duration := time.Since(CreationTimestamp.Time)

	if duration.Hours() > 24 {
		days := int(duration.Hours() / 24)
		return strconv.Itoa(days) + "d", nil
	}
	return duration.Round(time.Second).String(), nil
}
