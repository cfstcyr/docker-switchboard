package models

type Config struct {
	Port            int    `envconfig:"PORT" default:"8080"`
	Env             string `envconfig:"ENV" default:"development"`
	RefreshInterval int    `envconfig:"REFRESH_INTERVAL" default:"5"`
}
