const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
require('dotenv').config();

const users = [];
const logs = [];
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', function (req, res) {
  const { username } = req.body;
  const _id = nanoid(16);
  const user = { username, _id };
  const index = users.findIndex((item) => item.username == username);
  if (index != -1) {
    return res.json({ error: 'Username not available' });
  }
  users.push(user);
  res.json(user);
});

app.post('/api/users/:_id/exercises', function (req, res) {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const dateNow = new Date(Date.now()).toDateString();
  const dateInput = new Date(date).toDateString();

  const dateSend = date ? dateInput : dateNow;
  const durationSend = parseInt(duration);

  const indexUser = users.findIndex((item) => item._id == _id);
  const indexLog = logs.findIndex((item) => item._id == _id);

  const tempLog = { description, duration: durationSend, date: dateSend };

  if (indexLog != -1) {
    logs[indexLog].log.unshift(tempLog);
  } else {
    logs.push({ _id, log: [tempLog] });
  }

  res.json({
    username: users[indexUser].username,
    description,
    duration: durationSend,
    date: dateSend,
    _id,
  });
});

app.get('/api/users/:_id/logs', function (req, res) {
  const { from, to, limit } = req.query;
  const { _id } = req.params;

  const indexUser = users.findIndex((item) => item._id == _id);
  const indexLog = logs.findIndex((item) => item._id == _id);

  let log = logs[indexLog].log;
  let logLimit;
  function getDate(date) {
    return Math.floor(new Date(date).getTime());
  }

  if (from && to) {
    log = logs[indexLog].log.filter(
      (item) =>
        getDate(item.date) <= getDate(to) &&
        getDate(item.date) >= getDate(from),
    );
  } else if (from) {
    log = logs[indexLog].log.filter(
      (item) =>
        getDate(item.date) <= Date.now() && getDate(item.date) >= getDate(from),
    );
  }

  if (limit) {
    logLimit = log.slice(0, limit);
  }

  res.json({
    ...users[indexUser],
    from: from ? from : undefined,
    to: to ? to : undefined,
    count: limit ? logLimit.length : log.length,
    log: limit ? logLimit : log,
  });
});

app.get('/api/users', function (req, res) {
  res.json(users);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
