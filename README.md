<h1 style="border: none;" align="center">Docker Switchboard</h1>

<p align="center">
    <a href="https://github.com/cfstcyr/docker-switchboard/releases" alt="Github Release"><img src="https://img.shields.io/github/v/release/cfstcyr/docker-switchboard?logo=github" /></a>
    <a href="https://hub.docker.com/r/cfstcyr/docker-switchboard">
        <img src="https://img.shields.io/docker/v/cfstcyr/docker-switchboard?logo=docker" />
    </a>
    <a href="https://hub.docker.com/r/cfstcyr/docker-switchboard">
        <img src="https://img.shields.io/docker/image-size/cfstcyr/docker-switchboard?logo=docker" />
    </a>
</p>

<p align="center">
    <img src="https://img.shields.io/github/last-commit/cfstcyr/docker-switchboard">
    <img src="https://img.shields.io/github/commit-activity/m/cfstcyr/docker-switchboard.svg">
</p>

<hr>

<p style="font-size: 18px;" align="center"><b>Quickly control your Docker containers from a simple web UI</b></p>

<p align="center">
    <img src="./assets/screenshot.png" alt="Docker Switchboard Screenshot" width="600" />
</p>

---

## 📖 Overview

**Docker Switchboard** is a lightweight web application for managing your Docker containers. It provides a clean, user-friendly interface to start, stop, and monitor containers running on your host, making it ideal for local development, home labs, or small server setups.

> **Note:** Docker Switchboard is not intended to replace advanced container management solutions like Portainer or Rancher. Instead, it offers a fast, no-fuss way to control your containers without the command line.

## ✨ Features

- View all running and stopped containers
- Start and stop containers with a single click
- Auto-refresh container status
- Regex-based filtering to show only relevant containers
- Simple YAML configuration
- Very lightweight (*less than 7MB image size, ~50kB page size*)

## 🚀 Getting Started

### 1. Installation

You can run Docker Switchboard as a Docker container:

```sh
docker run -d \
  -p 8080:8080 \
  -v /path/to/config/app.yaml:/config/app.yaml \
  -v /var/run/docker.sock:/var/run/docker.sock \
  cfstcyr/docker-switchboard
```

Or use Docker Compose:

```yaml
services:
  switchboard:
    image: cfstcyr/docker-switchboard
    ports:
      - "8080:8080"
    volumes:
      - /path/to/config/app.yaml:/config/app.yaml
      - /var/run/docker.sock:/var/run/docker.sock
```

### 2. Configuration

#### Environment Variables

| Variable        | Description                                 | Default                |
|----------------|---------------------------------------------|------------------------|
| `PORT`         | The port on which the app will run           | `8080`                 |
| `CONFIG_PATH`  | Path to the configuration file               | `/config/app.yaml`     |

#### Configuration File (`app.yaml`)

The configuration file is a YAML file with the following fields:

| Field              | Description                                                        | Default |
|--------------------|--------------------------------------------------------------------|---------|
| `refresh_interval` | Interval (in seconds) to refresh the container list                | `5`     |
| `container_match`  | Regex pattern to match container names (only matching are shown)    | `.*`    |

**Example `app.yaml`:**

```yaml
refresh_interval: 5
container_match: ".*"
```

## 🖥️ Usage

1. Open your browser and go to `http://localhost:8080` (or the port you configured).
2. Use the web UI to view, start, or stop containers.

## 🛠️ Development

To run the project locally (requires Go and Node.js):

1. Clone the repository:
   ```sh
   git clone https://github.com/cfstcyr/docker-switchboard.git
   cd docker-switchboard
   ```
2. Start the backend API:
   ```sh
   cd apps/api
   go run main.go
   ```

   > On MacOS, you will need to pass DOCKER_HOST: `DOCKER_HOST=unix:///$HOME/.docker/run/docker.sock go run main.go`

3. Start the frontend client:
   ```sh
   cd apps/client
   pnpm install
   pnpm dev
   ```

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for bug fixes, features, or documentation improvements.

## 🙋 Support

For questions or support, open an issue on [GitHub](https://github.com/cfstcyr/docker-switchboard/issues).
