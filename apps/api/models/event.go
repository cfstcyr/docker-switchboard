package models

type Event struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}
