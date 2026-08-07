# Backend
The backend comprises of several moving components. As of now, it consists of an Express.js server that connects to a PostgreSQL database.

# Structure Overview

## Organization

```md
src/
├── controllers/
│   └── authController.ts
├── db/
│   ├── migrate.ts
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_interests_and_courses.sql
│   │   ├──...
│   └── pool.ts
├── routes/
│   └── auth.ts
├── server.ts
├── services/
│   └── authService.ts
└── util/
```

## db

The ```db``` folder contains all logic associated with the postgres connection.

* ```pool.ts``` creates and exports a new database connection pool using the DATABASE_URL environment variable. Other files that need to access the database import this pool instead of rebuilding each time.
* ```migrate.ts``` is a one-file migration runner upon immediate startup of the server. It looks through the ```migrations/``` folder and applies any new migrations not yet run. This acts as version control for our database.

## API

The backend features an extensive API that handles most user interactions with the application. The flow of logic between each layer is structured: 

Browser --> POST /api/auth/register --> Router --> Controller --> Service(s) --> Database

CURRENTLY: Logout JWT authentication

Tasks:

1. Register and Login endpoint
2. Logout endpoint
3. JWT authentication
4. Refresh and \me endpoint

### server.ts

This is the main server that runs the backend, and the first point of contact the frontend accesses. The REST API calls are first forwarded by ```server.ts``` to its respective router.

1. The router simply sends the request URL to its matching controller to handle. It does not include any actual business logic like JWT generation or SQL querying.

2. The controller is responsible for (as titled) controlling how each HTTP request is handled. It parses and formats the request body, calls the service function, and sends an HTTP response back. The extra layer of coordination keeps things modular and less cluttered.

3. The service is where all the application logic belongs. This includes JWT generation, password hashing, database insertion/retrieval, etc. By separating the actual business work from routing, this ensures that later on as the API develops more endpoints, files avoid becoming thousands of lines long.

### profile.ts

- GET /api/profile/me
Returns everything about the authenticated user's profile

- GET /api/profile/:userId
Returns everything public about another user's profile

- PUT /api/profile/me
Updates major, bio, graduation year

- PUT /api/profile/me/photo
Updates user photo url

- PUT /api/profile/me/interests
Updates user interests

- PUT /api/profile/me/courses
Updates user courses

- PUT /api/profile/me/availability
Updates user availability

- DELETE /api/profile/me/availability
Removes an availability for the user 

### match.ts

- POST /api/likes/:userId
Inserts the like, detects a reciprocal like, and creates a match if true

- DELETE /api/likes/:userId
Removes the user's like. If already matched, match still exists

- GET /api/matches/me
Returns all matches under the current user

- GET /api/matches/me/:matchId
Returns a specific match under the current user

- DELETE /api/matches/me/:matchId
Removes a specific match under the current user. Also simultaneously removes the user's like to the other.