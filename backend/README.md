# Job Portal Backend API

This is a complete, production-ready backend for a Job Portal application built with Spring Boot, MongoDB Atlas, and JWT-based Security.

## Features
- **JWT Authentication**: Secure login and signup for Job Seekers and Recruiters.
- **Role-Based Access Control (RBAC)**: Protect routes based on user roles (`JOB_SEEKER`, `RECRUITER`).
- **Job Management**: Recruiters can post, update, and delete jobs. Everyone can view and search.
- **Application Tracking**: Seekers can apply for jobs; Recruiters can manage application statuses.
- **Bookmarks**: Job seekers can save jobs for later.
- **Advanced Search**: Search jobs by title and location using MongoDB regex queries.

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- MongoDB (Local or Atlas)

## Installation & Setup

1. **Clone the repository**:
    `git clone <repository-url>`
    `cd job-portal-backend`

2. **Configure Database**:
    Open `src/main/resources/application.properties`.
    Update `spring.data.mongodb.uri` with your connection string.
    - Local: `mongodb://localhost:27017/jobportaldb`
    - Atlas: `mongodb+srv://<user>:<password>@cluster.mongodb.net/jobportaldb`

3. **Configure JWT Secret**:
    Ensure `jobportal.app.jwtSecret` is a long, secure string.

4. **Build the application**:
    `mvn clean install`

5. **Run the application**:
    `mvn spring-boot:run`

The server will start on `http://localhost:8080`.

## API Documentation

### Authentication
- `POST /api/auth/signup`: Register a new user.
    Body: `{ "username": "...", "email": "...", "password": "...", "roles": ["recruiter"] }`
- `POST /api/auth/signin`: Login to get JWT.
    Body: `{ "username": "...", "password": "..." }`

### Jobs
- `GET /api/jobs`: List jobs (optional params: `title`, `location`).
- `GET /api/jobs/{id}`: Get job details.
- `POST /api/jobs`: Create job (Recruiter only).
- `PUT /api/jobs/{id}`: Update job (Recruiter only).
- `DELETE /api/jobs/{id}`: Delete job (Recruiter only).

### Applications
- `POST /api/applications`: Apply for a job (Seeker only).
- `GET /api/applications/my`: View my applications (Seeker only).
- `GET /api/applications/job/{jobId}`: View applications for a specific job (Recruiter only).
- `PATCH /api/applications/{id}/status?status=ACCEPTED`: Update status (Recruiter only).

### Bookmarks
- `POST /api/bookmarks/{jobId}`: Toggle bookmark for a job (Seeker only).
- `GET /api/bookmarks`: Get all bookmarked jobs (Seeker only).

## Project Structure
- `model/`: Data entities (User, Job, etc.).
- `repository/`: Spring Data MongoDB repositories.
- `security/`: JWT and Spring Security configuration.
- `service/`: Business logic implementations.
- `controller/`: REST API endpoints.
- `dto/`: Data Transfer Objects for requests and responses.

## Troubleshooting
- **401 Unauthorized**: Ensure you include the `Authorization: Bearer <token>` header in your requests.
- **MongoDB Connection Error**: Check your URI in `application.properties` and ensure your IP is whitelisted in MongoDB Atlas.
- **Forbidden 403**: Ensure your user has the correct role for the requested endpoint.
