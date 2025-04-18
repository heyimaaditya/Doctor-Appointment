# Doctor Appointment System

## Overview

The Doctor Appointment System is a full-stack application designed for managing doctor appointments. This repository contains the backend built with Node.js, Express, Sequelize, and TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/en/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- A PostgreSQL database (or any compatible relational database)

## Setup

### Backend

1. **Navigate to the backend folder**

   Open your terminal and run:
   ```shell
   cd doctor-appointment-system/backend
   ```

2. **Install dependencies**
   ```shell
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the `backend` directory with the required environment settings. For example:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   PORT=3000
   ```

4. **Build the project**
   ```shell
   npm run build
   ```

5. **Start the server (development mode)**
   ```shell
   npm run dev
   ```

### Docker

To build the Docker image for the backend:

1. **Ensure Docker Desktop is running.**

2. **Build the image using npm script**
   ```shell
   npm run docker-build
   ```

3. **Run the Docker container**
   ```shell
   docker run -p 3000:3000 backend:latest
   ```

## Directory Structure

```
doctor-appointment-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.config.ts
│   │   ├── models/
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   └── ... 
│   │   └── server.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env (create this file)
└── frontend/ (if applicable)
```

## Contributing

Feel free to open issues or submit pull requests for improvements.

## License

This project is licensed under the MIT License.
