# Use a base image with Rust installed
FROM rust:latest as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Cargo.toml and Cargo.lock files to the container
COPY Cargo.toml Cargo.lock ./

# Build the dependencies without the application code
RUN cargo build --release --locked

# Copy the source code to the container
COPY src ./src

# Build the application
RUN cargo build --release --locked

# Use a minimal base image for the final application
FROM debian:buster-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/target/release/cilantrify-api ./

# Set the command to run the application
CMD ["./cilantrify-api"]

# In this Dockerfile, we're using a multi-stage build. The first stage (builder) builds the Rust application and its dependencies. It starts with the official Rust base image and sets the working directory to /app. We copy the Cargo.toml and Cargo.lock files first to leverage Docker's layer caching. Then, we build the dependencies using cargo build --release --locked. Next, we copy the source code to the container and build the application using cargo build --release --locked.

# The second stage uses a minimal base image (debian:buster-slim). It sets the working directory to /app and copies the built application from the builder stage using COPY --from=builder. Finally, we set the command to run the application using CMD ["./your-app-name"].

# Replace your-app-name with the actual name of your Rust application. You can build the Docker image using the docker build command and then run it with docker run. Make sure you are in the same directory as the Dockerfile when running these commands.

# Note: This is a basic Dockerfile for a Rust app, and you might
