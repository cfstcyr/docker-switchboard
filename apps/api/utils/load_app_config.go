package utils

import (
	"log"
	"os"

	"github.com/cfstcyr/docker-switchboard/models"
	"github.com/go-playground/validator/v10"
	"github.com/mcuadros/go-defaults"
	"gopkg.in/yaml.v3"
)

func LoadAppConfig(cfg *models.EnvConfig, out *models.AppConfig) error {
	data, err := os.ReadFile(cfg.AppConfigPath)

	validate := validator.New()

	if err != nil {
		defaults.SetDefaults(out)
		if err = validate.Struct(*out); err != nil {
			return err
		}
	} else {
		if err = yaml.Unmarshal(data, out); err != nil {
			return err
		}
		defaults.SetDefaults(out)
		if err = validate.Struct(*out); err != nil {
			return err
		}
		log.Printf("Loaded app config from %s", cfg.AppConfigPath)
	}

	log.Printf("App Config: %+v", *out)

	return nil
}
