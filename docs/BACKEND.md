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

The backend features an extensive API that handles most user interactions with the application. 

CURRENTLY: Logout JWT authentication

Tasks:

1. Register and Login endpoint
2. Logout endpoint
3. JWT authentication
4. Refresh and \me endpoint

