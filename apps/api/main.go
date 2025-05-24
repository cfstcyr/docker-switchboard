package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strconv"

	"github.com/cfstcyr/docker-switchboard/handlers"
	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/cfstcyr/docker-switchboard/services"
	"github.com/cfstcyr/docker-switchboard/utils"
	"github.com/kelseyhightower/envconfig"
)

//go:embed static/*
var embeddedFiles embed.FS

func main() {
	var cfg models.EnvConfig
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatal(err)
		return
	}

	var appCfg models.AppConfig
	if err = utils.LoadAppConfig(&cfg, &appCfg); err != nil {
		log.Fatal(err)
		return
	}

	content, err := fs.Sub(embeddedFiles, "static")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.FS(content)))

	container := services.GetContainer(&appCfg)

	handlers.RegisterWebsocketRoute(mux, container)
	handlers.RegisterDockerHandlers(mux, container)

	container.ContainersBroadcastService.Init()

	loggedMux := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL.Path)
		mux.ServeHTTP(w, r)
	})

	log.Printf("Listening on http://localhost:%d", cfg.Port)
	if err := http.ListenAndServe(":"+strconv.Itoa(cfg.Port), loggedMux); err != nil {
		log.Fatal(err)
	}
}
