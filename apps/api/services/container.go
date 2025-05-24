package services

import (
	"sync"
	"time"

	"github.com/cfstcyr/docker-switchboard/models"
)

type Container struct {
	WsService                  *WsService
	DockerService              *DockerService
	ContainersBroadcastService *BroadcastService[[]models.Container]
}

var (
	instance *Container
	once     sync.Once
)

func GetContainer(cfg *models.Config) *Container {
	once.Do(func() {
		wsService := NewWsService()
		dockerService := NewDockerService()
		broadcastService := NewBroadcastService(BroadcastOptions[[]models.Container]{
			WsService: wsService,
			Interval:  time.Duration(cfg.RefreshInterval),
			EventName: "containers",
			GetData:   dockerService.RefreshContainers,
		})

		instance = &Container{
			WsService:                  wsService,
			DockerService:              dockerService,
			ContainersBroadcastService: broadcastService,
		}
	})
	return instance
}
