# LectureLink
This project is essentially LinkedUp v2, built by college students for college students. Much of the same functionality remains here: find a study partner or group, match up, and meet up! This is simply a re-optimized version that utilizes a more versatile tech stack using React, PostgreSQL, and Express. 

# Getting Started

## Dependencies

* Node.js (18 or higher)
* Express
* Typescript
* Docker
* Docker-compose

## Installing

1. Clone the repository

```bash
git clone https://github.com/GraceTang323/LectureLink.git
```

2. Install Express and Typescript

```bash
npm install express
npm install --save-dev typescript @types/express @types/node
```

3. Run the backend

```bash
npm run start
```

or 

```bash
docker compose up -d
```

# Architecture

## Database

All data is stored using PostgreSQL, which handles user information, matching logic, messages, and more.

We use database migration to efficiently update and apply any new database modifications, so that any user wanting to run the application locally can easily run the newest version.

The ```migration.ts``` script in ```/db``` automatically performs schema versioning. Note that because this is a non-production project, I opted to write my own migration runner instead of using an official tool like ```node-pg-migrate``` or Drizzle.

# Troubleshooting

## Database

Once running, navigate to the ```postgres``` container and run the following command to enter the interactive shell

```bash
psql -U <db_user> -d <db_name>
```

Here are some example commands:
* \dt  ->  Lists all tables inside the database
* \d tablename  ->  Describes a table
* \d+ tablename  ->  Shows detailed table properties including disk size (q to exit)
* \dn ->  Lists all schemas
* \dv ->  Lists all database views
* \di ->  Lists all indexes
* \df ->  Lists all stored procedures and functions
* \dx ->  Lists all installed extensions