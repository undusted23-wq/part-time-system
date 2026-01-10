# Part-Time System API Backend

This is the backend REST API for the part-time system, implemented using Spring Boot and SQLite.

## Technology Stack

- Java 21
- Spring Boot 3.4.4
- Spring Security with JWT Authentication
- Spring Data JPA
- SQLite Database
- Lombok

## Getting Started

### Prerequisites

- Java 21 or higher
- Maven

### Running the Application

1. Clone the repository
2. Navigate to the backend directory
3. Run the application:

```bash
./mvnw spring:run
```

The application will be available at `http://localhost:8080`.

## API Documentation

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login and get authentication token | Public |
| POST | `/api/auth/register` | Register a new user | Public |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/me` | Get current user information | Authenticated |
| GET | `/api/users/{id}` | Get user by ID | Admin or Owner |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/role/{role}` | Get users by role | Admin |
| PUT | `/api/users/{id}` | Update user | Admin or Owner |
| DELETE | `/api/users/{id}` | Delete user | Admin |
| POST | `/api/users/{id}/change-password` | Change user password | Admin or Owner |

### Companies

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/companies` | Get all companies | Public |
| GET | `/api/companies/verified` | Get verified companies | Public |
| GET | `/api/companies/{id}` | Get company by ID | Public |
| GET | `/api/companies/search` | Search companies | Public |
| GET | `/api/companies/employer` | Get current employer's companies | Employer |
| POST | `/api/companies` | Create a new company | Employer |
| PUT | `/api/companies/{id}` | Update company | Employer (owner) or Admin |
| PUT | `/api/companies/{id}/verify` | Verify company | Admin |
| DELETE | `/api/companies/{id}` | Delete company | Employer (owner) or Admin |

### Jobs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/jobs` | Get all jobs | Public |
| GET | `/api/jobs/active` | Get active jobs | Public |
| GET | `/api/jobs/{id}` | Get job by ID | Public |
| GET | `/api/jobs/company/{companyId}` | Get jobs by company | Public |
| GET | `/api/jobs/search` | Search jobs | Public |
| POST | `/api/jobs` | Create a new job | Employer |
| PUT | `/api/jobs/{id}` | Update job | Employer (owner) or Admin |
| PUT | `/api/jobs/{id}/status` | Update job status | Employer (owner) or Admin |
| PUT | `/api/jobs/{id}/deadline` | Update job deadline | Employer (owner) or Admin |
| DELETE | `/api/jobs/{id}` | Delete job | Employer (owner) or Admin |

### Job Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/applications` | Get all applications | Admin |
| GET | `/api/applications/{id}` | Get application by ID | Admin, Applicant or Employer |
| GET | `/api/applications/my-applications` | Get current student's applications | Student |
| GET | `/api/applications/job/{jobId}` | Get applications by job | Admin or Employer |
| GET | `/api/applications/status/{status}` | Get applications by status | Admin |
| GET | `/api/applications/job/{jobId}/status/{status}` | Get applications by job and status | Admin or Employer |
| POST | `/api/applications` | Apply for a job | Student |
| PUT | `/api/applications/{id}/status` | Update application status | Admin or Employer |
| PUT | `/api/applications/{id}/notes` | Add employer notes | Admin or Employer |
| DELETE | `/api/applications/{id}` | Withdraw application | Admin or Applicant |

## Default Users

The system is initialized with the following default users:

1. **Admin**
   - Username: admin
   - Password: admin123
   - Role: ADMIN

2. **Employer**
   - Username: employer
   - Password: employer123
   - Role: EMPLOYER

3. **Student**
   - Username: student
   - Password: student123
   - Role: STUDENT
