package handlers

import (
	"net/http"

	"github.com/cfstcyr/docker-switchboard/services"
)

func RegisterWebsocketRoute(mux *http.ServeMux, container *services.Container) {
	mux.HandleFunc("/api/ws", container.WsService.Handler())
}
