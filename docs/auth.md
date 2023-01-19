# Authentication flow


An authentication flow for a private image series

## Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB
    participant Store
    participant Redis
    Client->>Server: GET /series/foo?password=***
    Server->>DB: GET foo if password correct
    DB->>Server: Returns requested series
    Note left of Server: Signs JWT with a list<br>of requested images
    Server->>Client: Returns JWT and redirects to series page
    Note left of Client: Sets JWT as Header/Cookie<br>Now all requests are authorized
    Client->>Server: GET /images/img1.jpg
    Note left of Server: Proxies the request to store<br>Makes authorized request to store
    Server-->>Redis: Gets cached image
    Server->>Store: GET /<...>/img1.jpg
    Store-->>Client: Sends requested image/object
```

## Advantages

- Scalable because of cloud store
- Assets arent't stored in git repo
- JWTs prevent expensive DB calls on each image request
- No client session to manage

## Disadvantages

- Proxying results in slight latency