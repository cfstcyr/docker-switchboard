package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strconv"

	"github.com/cfstcyr/docker-switchboard/models"
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

	container := GetContainer(&cfg)

	container.WsService.RegisterWebsocketRoute(mux)
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
