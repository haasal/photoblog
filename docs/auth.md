# Serverless/Stateless auth

- Token has collection name as payload
- DB can be a Mongo DB instance + redis cache

## Database Schema

```json
"collection": {
    "title": "xxx"
    "password": "******",
    "images": [
        ...
    ]
},
"image": {
    "private": true,
    "name": "xxx.jpg"
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
    Server-->DB: Check collection permissions
    Server->>Client: Signed jwt with <cname><br>+ (prerendered) collection page
    Client->>Function: GET /image/<cname>/<iname>
    Note right of Function: Check jwt
    Function-->DB: Check image permissions
    Function->>Client: Requested image
```

- small jwt
- low latency due to partial auth in function (no redirect)
- images get served directly (without rewrites)