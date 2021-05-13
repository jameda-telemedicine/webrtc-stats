const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const util = require('util');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());
const port = 3000;

app.post('/:conference', (req, res) => {
  const date = new Date();
  const conferenceName = req.params.conference;
  console.log(date, conferenceName, util.inspect(req.body, false, null, true));
  res.send('OK');
});

app.post('/', (req, res) => {
  const date = new Date();
  console.log(date, '(no room)', req.body);
  res.status(404).send('You have to specify a room name, like /foo');
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})
