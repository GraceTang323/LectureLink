# System Design

This documents and reports major architectural changes/choices made for LectureLink. Detailed context regarding decisions, pros, and cons for each element, as well as future performance testing results.

## ADR-001: PostgreSQL over Firestore

### Context:
The original application used Firebase's document database.

### Decision:
Use a relational database (PostgreSQL) for v2.

### Reasons:

I chose PostgreSQL because LinkedUP has highly relational data, which requires multiple transactional operations (especially likes and matches). This provies stronger referential integrity and query flexibility than FireStore's NoSQL model. Needing additional backend and database complexity seems like a minimal tradeoff.

- Strong relationships between users, courses, interests, matches...
- Transactional match creation
- Referential integrity
- Flexible SQL filtering
- Better control over schema

### Tradeoffs:
- More complicated backend development
- Increased need for frequent database management
- Need to implement authentication/session management manually

## ADR-002: Node.js + Express.js over Kotlin

### Context:
The original application was written entirely in Kotlin.

### Decision:
Transition to a lightweight + stateless API

### Reasons:
Node.js and Express let me define a separated, modular API layer. Because LectureLink is primarily I/O bound, it mainly handles HTTP requests, performs database queries, authentication, and real-time messaging. It does not require any heavy CPU-bound computations.

- High I/O throughput
- Seamless horizontal scaling, simpler load balancer logic (if needed in the future)
- High fault tolerance. No Single Point of Failure because clients can retry requests to other healthy servers
- No cascading failures because requests are independent
- Fast prototyping
- Simpler implementation and testing

### Tradeoffs:
- Reliance on third-party middleware for other essential functionalities
- Node.js runs on one CPU core by default. Heavy tasks can block the main thread

## ADR-003: React-Native + Expo over Kotlin

### Context:
The original application was written entirely in Kotlin.

### Decision:
Adopt the React Native framework.

### Reasons:
I chose to build the frontend as a React + Expo app rather than strictly Kotlin, because it can run on both iOS and Android platforms without the need for an additional codebase. Expo also provides easy UI testing and fast refresh. The tradeoffs are a potentially slower performance speed and complex code updates after each software update.

- Reusable code across iOS and Android platforms
- Able to view UI changes instantaneously upon code modifications
- Extensive native library for standard hardware features (camera, push notifications, geolocation)
- Fast and easy development/testing via Expo Go app

### Tradeoffs:
- Expo Go app on iOS only goes up to SDK version 54, 55 and up versions must set up a custom development build
- Heavy reliance on Expo vendor cycles
- Larger size overhead when building app

# Experiments

## Discovery endpoint

```bash
GET /api/discovery/users    // returns 100 users
```

### Without Index (ms)
- Response time:
- Database query time:
- Rows scanned:

### With Index (ms)
- Response time:
- Database query time:
- Rows scanned:

