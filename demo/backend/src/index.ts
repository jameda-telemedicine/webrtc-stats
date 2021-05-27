import express from 'express';
import cors from 'cors';
import util from 'util';
import { Client } from '@elastic/elasticsearch';

(async () => {
  const client = new Client({ node: 'http://localhost:9200' });
  await client.ping();

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
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
  });

  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
