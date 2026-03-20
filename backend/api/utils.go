package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

func renderJSON(w http.ResponseWriter, data interface{}) {

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if err := json.NewEncoder(w).Encode(data); err != nil {

		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func newRequestContext(parent context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, requestTimeout)
}

func renderCachedJSON(w http.ResponseWriter, cacheKey string, ttl time.Duration, fetch func() (interface{}, error)) {
	if cachedData, found := globalCache.Get(cacheKey); found {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("X-Cache", "HIT")
		w.WriteHeader(http.StatusOK)
		w.Write(cachedData)
		return
	}

	data, err := fetch()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	globalCache.Set(cacheKey, jsonData, ttl)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Cache", "MISS")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
