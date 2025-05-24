package models

import (
	"errors"
	"strings"

	"github.com/docker/docker/api/types/container"
)

type Container struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	State string `json:"state"`
}

func FromSummary(summary container.Summary) (Container, error) {
	if len(summary.Names) == 0 || summary.Names[0] == "" {
		return Container{}, errors.New("container name is empty")
	}

	return Container{
		ID:    summary.ID,
		Name:  strings.TrimPrefix(summary.Names[0], "/"),
		State: summary.State,
	}, nil
}
