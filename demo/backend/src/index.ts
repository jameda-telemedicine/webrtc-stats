import express from 'express';
import cors from 'cors';
import util from 'util';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { name as templateName, template } from './indexTemplate';
import { createEntries, ElasticStatEntry, validateStatEntry } from './models';

const port = 3000;
const elasticClient = new ElasticClient({
  node: 'http://localhost:9200',
});

const ensureIndexTemplateExists = async () => {
  await elasticClient.indices.putIndexTemplate({
    name: templateName,
    body: template,
  });
};

const sendEntries = async (entries: ElasticStatEntry[], now: number) => {
  const date = new Date(now);
  const year = date.getUTCFullYear();
  const month = 1 + date.getUTCMonth();
  const day = date.getUTCDate();

  const body = entries.flatMap((doc) => [{
    index: {
      _index: `${templateName}-${year}.${month}.${day}`,
    },
  }, doc]);

  await elasticClient.bulk({ refresh: true, body });
};

(async () => {
  await elasticClient.ping();
  await ensureIndexTemplateExists();

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  app.post('/:conference', async (req, res) => {
    const date = new Date();
    const conferenceName = req.params.conference;
    const body = validateStatEntry(req.body);

    if (!body.valid) {
      console.log(
        date,
        conferenceName,
        '[ERROR]',
        util.inspect({ body: req.body, errors: body.errors }, false, null, true),
      );
      res.status(400).send({ success: false, errors: body.errors });
      return;
    }

    const { data } = body;
    const now = Date.now();
    const entries = createEntries(data, now);
    await sendEntries(entries, now);

    console.log(date, conferenceName, util.inspect(data, false, null, true));
    res.send({ success: true });
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
