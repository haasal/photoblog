# Authentication flow

An authentication flow for a private image series

## Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB
    participant Redis
    Client->>Server: GET /series/foo?password=***
    Server-->>Redis: Get cached series
    Server->>DB: GET foo if password correct/public
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

## JWT flow on GET requests

```mermaid
flowchart TB
    A["GET /series/{name}"]
    A --> B{JWT present/valid?}
    B --> |yes| C1{Requested series in claims?}
    C1 --> |yes| C1D1[Send requested images]
    B --> |no| C2{Password supplied?}
    C2 --> |yes| C2D1[xxx]
    C2 --> |no| C2D2[Check DB]
```

```mermaid
flowchart TB
    B["GET /series/[name]/[image]"]
```


## Advantages

- Scalable because of cloud store
- Assets arent't stored in git repo
- JWTs prevent expensive DB calls on each image request
- No client session to manage

## Disadvantages

- Proxying results in slight latency
