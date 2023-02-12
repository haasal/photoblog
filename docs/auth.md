# Serverless/Stateless auth

- Token has collection name as payload
- DB can be a Mongo DB instance + redis cache

## Database Schema

```json
"collection": {
    "title": "xxx"
    "password": "******",
    "images": [
        {
            "id": 1234,
            "private": true,
            "name": "xxx.jpg",
            ...
        },
        {...}
    ]
}
```

## Authentication flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Function
    participant DB
    Client->>Server: GET /collection/<cname>
    Server-->DB: Check collection permissions<br>(password/public/jwt)
    Server->>Client: Signed jwt with <cname><br>+ (prerendered) collection page
    Client->>Function: GET /image/<cname>/<iname>
    Note right of Function: Check jwt
    Function-->DB: Check image permissions
    Function->>Client: Requested image
```

- small jwt (only collection names needed)
- low latency due to partial auth in function (no redirect)
- images get served directly (without rewrites)

## /collection/\<cname> route

```mermaid
graph TD
    A{"Token in cookie?"}

    A-->|yes|B["Verify token"]
    B-->C{"Is token authenticated?"}

    C-->|yes|OK["200 OK"]
    C-->|no|CHECK["Check db if collection is private"]
    CHECK-->PRIVATE{"Collection is private?"}

    PRIVATE-->|no|ADD["Add collection to jwt"]
    ADD-->OK

    A-->|no|CHECK
    PRIVATE-->|yes|PASS{"Password is set in query?"}
    PASS-->|no|UNAUTH["40X Unauthenticated!"]
    PASS-->|yes|CORRECT{"Password correct?"}
    CORRECT-->|yes|ADD
    CORRECT-->|no|UNAUTH
```
