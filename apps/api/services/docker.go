package services

import (
	"context"
	"log"
	"regexp"
	"sync"

	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type DockerService struct {
	cfg                *models.AppConfig
	lastContainers     []container.Summary
	lastContainersLock sync.Mutex
}

func NewDockerService(cfg *models.AppConfig) *DockerService {
	return &DockerService{
		cfg:                cfg,
		lastContainers:     nil,
		lastContainersLock: sync.Mutex{},
	}
}

func StartContainer(containerID string) error {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())

	if err != nil {
		return err
	}

	cli.NegotiateAPIVersion(ctx)
	err = cli.ContainerStart(ctx, containerID, container.StartOptions{})

	if err != nil {
		return err
	}

	log.Printf("Container %s started\n", containerID)

	return nil
}

func StopContainer(containerID string) error {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())

	if err != nil {
		return err
	}

	cli.NegotiateAPIVersion(ctx)
	err = cli.ContainerStop(ctx, containerID, container.StopOptions{})

	if err != nil {
		return err
	}

	return nil
}

func mapContainers(containers []container.Summary) []models.Container {
	mappedContainers := make([]models.Container, len(containers))

	for i, s := range containers {
		if container, err := models.FromSummary(s); err == nil {

			mappedContainers[i] = container
		}
	}

	return mappedContainers
}

func (d *DockerService) getContainers() ([]container.Summary, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())

	if err != nil {
		return nil, err
	}

	cli.NegotiateAPIVersion(ctx)
	containers, err := cli.ContainerList(ctx, container.ListOptions{All: true})

	if err != nil {
		return nil, err
	}

	return containers, nil
}

func (d *DockerService) filterContainers(containers []models.Container) []models.Container {
	filtered := make([]models.Container, 0, len(containers))

	for _, c := range containers {
		if d.cfg.ContainerMatch == "" || regexp.MustCompile(d.cfg.ContainerMatch).MatchString(c.Name) {
			filtered = append(filtered, c)
		}
	}

	return filtered[:len(filtered):len(filtered)]
}

func (d *DockerService) GetContainers(forceUpdate bool) ([]models.Container, error) {
	d.lastContainersLock.Lock()
	defer d.lastContainersLock.Unlock()

	if d.lastContainers == nil || forceUpdate {
		containers, err := d.getContainers()
		if err != nil {
			return nil, err
		}
		d.lastContainers = containers
	}

	return d.filterContainers(mapContainers(d.lastContainers)), nil
}

func (d *DockerService) RefreshContainers() ([]models.Container, error) {
	return d.GetContainers(true)
}
