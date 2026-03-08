package api

import (
	"encoding/json"
	"net/http"
)

func renderJSON(w http.ResponseWriter, data interface{}) {

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if err := json.NewEncoder(w).Encode(data); err != nil {

		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
