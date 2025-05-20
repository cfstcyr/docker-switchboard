package models

type Event struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}

type EventContainer struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
