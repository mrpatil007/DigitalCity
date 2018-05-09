// Get dependencies
const app = require('express')();
const express = require('express');
const path = require('path');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const io = require('socket.io')(http);

const config = require('./api/config');
const SUGGESTIONS_API_ENDPOINT = config.api.endpoint + '/suggestions/';

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Set our api routes
const api = require('./api');
app.use('/api', api);

// socket.io search autosuggest
io.on('connection', function(socket) {
  socket.on('suggestions', function(text) {
    fetch(SUGGESTIONS_API_ENDPOINT + text)
      .then(results => results.json())
      .then(suggestions => socket.emit('suggestions', suggestions))
      .catch(error => console.log(error));
  });
});

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */
http.listen(port, () => console.log(`API running on localhost:${port}`));
