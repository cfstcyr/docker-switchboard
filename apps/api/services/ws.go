package services

import (
	"log"
	"net/http"
	"sync"

	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/gorilla/websocket"
)

type WsService struct {
	clients          map[*websocket.Conn]bool
	lock             sync.Mutex
	ConnectClient    models.Subject[*websocket.Conn]
	DisconnectClient models.Subject[*websocket.Conn]
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func NewWsService() *WsService {
	return &WsService{
		clients:          make(map[*websocket.Conn]bool),
		ConnectClient:    *models.NewSubject[*websocket.Conn](),
		DisconnectClient: *models.NewSubject[*websocket.Conn](),
	}
}

func (h *WsService) Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("WebSocket connection established")
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}

		h.lock.Lock()
		h.clients[conn] = true
		h.lock.Unlock()

		h.ConnectClient.Next(conn)

		defer func() {
			h.lock.Lock()
			delete(h.clients, conn)
			h.DisconnectClient.Next(conn)
			h.lock.Unlock()
			if err := conn.Close(); err != nil {
				log.Println("Error closing WebSocket connection:", err)
			}
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				log.Println("WebSocket read error:", err)
				break
			}
		}
	}
}

func (h *WsService) GetClientCount() int {
	h.lock.Lock()
	defer h.lock.Unlock()
	return len(h.clients)
}

func Send(conn *websocket.Conn, event models.Event) error {
	if err := conn.WriteJSON(event); err != nil {
		log.Println("Error sending WebSocket message:", err)
		return err
	}
	return nil
}

func (h *WsService) SendAll(event models.Event) []error {
	h.lock.Lock()
	defer h.lock.Unlock()

	errors := make([]error, 0)

	for conn := range h.clients {
		if err := Send(conn, event); err != nil {
			errors = append(errors, err)
			delete(h.clients, conn)
			conn.Close()
		}
	}

	return errors
}
