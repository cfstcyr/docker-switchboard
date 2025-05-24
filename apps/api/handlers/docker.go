package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cfstcyr/docker-switchboard/services"
)

func RegisterDockerHandlers(mux *http.ServeMux, container *services.Container) {
	mux.HandleFunc("/api/docker/containers/update", containersHandler(container))
}

func containersHandler(container *services.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			containers, err := container.ContainersBroadcastService.ExecuteNow()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(containers)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
