package main

import (
	"sync"
	"time"

	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/cfstcyr/docker-switchboard/services"
)

type Container struct {
	WsService                  *services.WsService
	DockerService              *services.DockerService
	ContainersBroadcastService *services.BroadcastService[[]models.Container]
}

var (
	instance *Container
	once     sync.Once
)

func GetContainer(cfg *models.Config) *Container {
	once.Do(func() {

		instance = &Container{
			WsService:     services.NewWsService(),
			DockerService: services.NewDockerService(),
			ContainersBroadcastService: services.NewBroadcastService(services.BroadcastOptions[[]models.Container]{
				WsService: instance.WsService,
				Interval:  time.Duration(cfg.RefreshInterval),
				EventName: "containers",
				GetData:   instance.DockerService.RefreshContainers,
			}),
		}
	})
	return instance
}
