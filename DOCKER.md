# Docker Setup for IT Career Roadmap

This project uses Docker to containerize both the frontend (React/Vite) and backend (NestJS) applications, simplifying both development and production deployments.

## Services

*   `web`: The frontend application.
*   `server`: The backend NestJS application.

## Prerequisites

*   [Docker](https://docs.docker.com/get-docker/) installed.
*   [Docker Compose](https://docs.docker.com/compose/install/) installed.

## NPM Scripts

We have provided convenient NPM scripts in the root `package.json` to manage the Docker containers:

*   **`npm run docker:dev`**: Starts the development environment using `docker-compose.dev.yml`.
*   **`npm run docker:prod`**: Starts the production environment using `docker-compose.yml` in detached mode.
*   **`npm run docker:stop`**: Stops and removes all containers created by the development or production compose files.
*   **`npm run docker:clean`**: Cleans up the Docker system by pruning all unused containers, networks, images, and volumes. **Use with caution!**

## Development Environment

The development environment is configured in `docker-compose.dev.yml`. It uses `Dockerfile.dev` for both `web` and `server` applications.

### Features
*   **Hot-reloading:** Source code directories (`./apps/web` and `./apps/server`) are mapped as volumes to the containers. Changes made locally will instantly reflect in the running containers without needing a rebuild.
*   **Environment Variables:** Loads environment variables from `.env.development` files in each application directory.

### Running Dev Environment

1. Make sure you have your `.env.development` files configured in `apps/server` and `apps/web`.
2. Run the development script:
   ```bash
   npm run docker:dev
   ```

**Access URLs:**
*   **Web App:** [http://localhost:5173](http://localhost:5173)
*   **Server App:** [http://localhost:3000](http://localhost:3000)

## Production Environment

The production environment is configured in `docker-compose.yml`. It uses standard `Dockerfile` for both applications to build optimized production images.

### Features
*   **Optimized Builds:** Uses multi-stage builds for smaller, production-ready images.
*   **Detached Mode:** Starts containers in the background by default.
*   **Environment Variables:** Loads environment variables from `.env` files. Ensure you have properly configured variables like `VITE_API_URL` for the web application's build arguments.

### Running Prod Environment

1. Make sure you have your `.env` files configured in `apps/server` and `apps/web`.
2. Run the production script:
   ```bash
   npm run docker:prod
   ```

**Access URLs:**
*   **Web App:** [http://localhost](http://localhost) (Port 80)
*   **Server App:** [http://localhost:3000](http://localhost:3000)

## Troubleshooting

*   **Port Conflicts:** Ensure ports `3000`, `5173` (dev), and `80` (prod) are not being used by other applications on your system.
*   **Environment Variables:** If services fail to connect, double check the corresponding environment files. Note that `docker-compose.yml` passes `VITE_API_URL` as a build argument.
*   **Stale Modules/Builds:** If you face issues after adding new packages, restart your environment or use `npm run docker:clean` to ensure you're building from a clean slate.
