package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/cfstcyr/docker-switchboard/services"
	"github.com/kelseyhightower/envconfig"
)

//go:embed static/*
var embeddedFiles embed.FS

func main() {
	var cfg models.Config
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatal(err)
	}

	content, err := fs.Sub(embeddedFiles, "static")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.FS(content)))

	wsService := services.NewWsService()
	dockerService := services.NewDockerService()
	broadcastService := services.NewBroadcastService(services.BroadcastOptions[[]models.Container]{
		WsService: wsService,
		Interval:  time.Duration(cfg.RefreshInterval),
		EventName: "containers",
		GetData:   dockerService.RefreshContainers,
	})

	wsService.RegisterWebsocketRoute(mux)
	broadcastService.Init()

	loggedMux := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL.Path)
		mux.ServeHTTP(w, r)
	})

	log.Printf("Listening on http://localhost:%d", cfg.Port)
	if err := http.ListenAndServe(":"+strconv.Itoa(cfg.Port), loggedMux); err != nil {
		log.Fatal(err)
	}
}
