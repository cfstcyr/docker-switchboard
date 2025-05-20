package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type wsHub struct {
	clients map[*websocket.Conn]bool
	lock    sync.Mutex
}

var hub = wsHub{
	clients: make(map[*websocket.Conn]bool),
}

var (
	lastContainers     []container.Summary
	lastContainersLock sync.Mutex
	broadcastRunning   bool
	broadcastStop      chan struct{}
)

func RegisterWebsocketRoute(mux *http.ServeMux, cfg *models.Config) {
	mux.HandleFunc("/ws", wsHandler(cfg))
}

func wsHandler(cfg *models.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("WebSocket connection established")
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}

		hub.lock.Lock()
		hub.clients[conn] = true
		startBroadcastIfNeeded(cfg)
		hub.lock.Unlock()

		// Send last containers immediately to just connected socket
		lastContainersLock.Lock()
		if lastContainers != nil {
			if err := sendContainersEvent(conn, lastContainers); err != nil {
				log.Println("Error sending WebSocket message:", err)
			}
		}
		lastContainersLock.Unlock()

		defer func() {
			hub.lock.Lock()
			delete(hub.clients, conn)
			if len(hub.clients) == 0 {
				stopBroadcastIfNeeded()
			}
			hub.lock.Unlock()
			if err := conn.Close(); err != nil {
				log.Println("Error closing WebSocket connection:", err)
			}
		}()
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}
}

func startBroadcastIfNeeded(cfg *models.Config) {
	if !broadcastRunning {
		broadcastRunning = true
		broadcastStop = make(chan struct{})
		go broadcastDockerContainers(cfg)
	}
}

func stopBroadcastIfNeeded() {
	if broadcastRunning {
		close(broadcastStop)
		broadcastRunning = false
	}
}

func broadcastDockerContainers(cfg *models.Config) {
	ticker := time.NewTicker(time.Duration(cfg.RefreshInterval) * time.Second)
	defer ticker.Stop()

	doBroadcast := func(logPrefix string) {
		hub.lock.Lock()
		clientCount := len(hub.clients)
		hub.lock.Unlock()
		if clientCount == 0 {
			return
		}
		log.Println(logPrefix)
		containers, err := getRunningContainers()
		if err != nil {
			log.Println("Error fetching containers:", err)
			return
		}

		lastContainersLock.Lock()
		lastContainers = containers
		lastContainersLock.Unlock()

		hub.lock.Lock()
		for c := range hub.clients {
			if err := sendContainersEvent(c, containers); err != nil {
				log.Println("Error sending WebSocket message:", err)
			}
		}
		hub.lock.Unlock()
	}

	// Run immediately on start
	doBroadcast("Broadcasting Docker containers (immediate)")

	for {
		select {
		case <-broadcastStop:
			log.Println("Stopping Docker containers broadcast (no clients)")
			return
		case <-ticker.C:
			doBroadcast("Broadcasting Docker containers")
		}
	}
}

func getRunningContainers() ([]container.Summary, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	cli.NegotiateAPIVersion(ctx)
	containers, err := cli.ContainerList(ctx, container.ListOptions{All: false})
	if err != nil {
		return nil, err
	}
	return containers, nil
}

func sendContainersEvent(conn *websocket.Conn, containers []container.Summary) error {
	mapped := make([]models.EventContainer, len(containers))

	for i, c := range containers {
		if len(c.Names) == 0 || c.Names[0] == "" {
			continue
		}
		mapped[i] = models.EventContainer{
			ID:   c.ID,
			Name: strings.TrimPrefix(c.Names[0], "/"),
		}
	}

	event := models.Event{
		Event: "containers",
		Data:  mapped,
	}
	msg, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return conn.WriteMessage(websocket.TextMessage, msg)
}
