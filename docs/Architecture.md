# System Architecture

## Overview

DueTrack uses a three-tier architecture.

```text
User
 |
 v
Frontend
(HTML/CSS/JavaScript)
 |
 v
Express API
(Node.js)
 |
 v
SQLite Database
```

## Frontend

The frontend provides the user interface and allows users to interact with courses and assignments.

## Backend

The backend processes requests and communicates with the database using REST API routes.

## Database

SQLite stores course and assignment data.

## MVC Architecture

Model:
Handles data and database interactions.

View:
Displays pages and information to users.

Controller:
Processes requests and coordinates communication between the model and view.