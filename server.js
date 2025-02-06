const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port

app.get('/', (req, res) => {
    res.send('Hello, Express is working!');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.get('/about', (req, res) => {
    res.send('About the Company');
  });
// start the server on the port and output a confirmation to the console
app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));