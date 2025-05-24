package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/cfstcyr/docker-switchboard/services"
)

func RegisterDockerHandlers(mux *http.ServeMux, container *services.Container) {
	mux.HandleFunc("/api/docker/containers/update", updateContainersHandler(container))
	mux.HandleFunc("/api/docker/containers/start", startContainerHandler(container))
	mux.HandleFunc("/api/docker/containers/stop", stopContainerHandler(container))
}

func updateContainersHandler(container *services.Container) http.HandlerFunc {
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

func startContainerHandler(container *services.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			containerID := r.URL.Query().Get("id")
			log.Printf("Starting container with ID: %s\n", containerID)
			if containerID == "" {
				http.Error(w, "Container ID is required", http.StatusBadRequest)
				return
			}

			err := services.StartContainer(containerID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			time.Sleep(200 * time.Millisecond)
			container.ContainersBroadcastService.ExecuteNow()

			w.WriteHeader(http.StatusNoContent)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func stopContainerHandler(container *services.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			containerID := r.URL.Query().Get("id")
			if containerID == "" {
				http.Error(w, "Container ID is required", http.StatusBadRequest)
				return
			}

			err := services.StopContainer(containerID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			time.Sleep(200 * time.Millisecond)
			container.ContainersBroadcastService.ExecuteNow()

			w.WriteHeader(http.StatusNoContent)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
