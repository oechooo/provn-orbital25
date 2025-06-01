# Code Citations

## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    userRepository.merge
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    userRepository.merge(user, req.body);
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    userRepository.merge(user, req.body);
    const result = await userRepository.
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    userRepository.merge(user, req.body);
    const result = await userRepository.save(user);
    res.
```


## License: unknown
https://github.com/vuthanhnhan/homebase/blob/b06cf5569d697dc99d988ed20f1c1b6723b5ee2d/express/src/controllers/users.ts

```
: parseInt(req.params.id) });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    userRepository.merge(user, req.body);
    const result = await userRepository.save(user);
    res.json(result
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api/users');
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api/users');
    expect(response
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).
```


## License: unknown
https://github.com/xevor11/Safe-Routes/blob/799afac487670fc2d62267836992bb3c7bd44814/Server/tests/integration/userRoutes.test.js

```
users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true
```

