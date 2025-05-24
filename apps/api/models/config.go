package models

type EnvConfig struct {
	Port          int    `envconfig:"PORT" default:"8080"`
	Env           string `envconfig:"ENV" default:"development"`
	AppConfigPath string `envconfig:"CONFIG_PATH" default:"/config/app.yaml"`
}

type AppConfig struct {
	RefreshInterval int    `default:"3" yaml:"refresh_interval" validate:"required"`
	ContainerMatch  string `default:".*" yaml:"container_match" validate:"required"`
}
