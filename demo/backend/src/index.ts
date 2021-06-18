import express from 'express';
import useragent from 'express-useragent';
import cors from 'cors';
import util from 'util';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { name as templateName, template } from './indexTemplate';
import { createEntries, ElasticStatEntry, validateStatEntry } from './models';

// configuration using environment variables
const port = process.env.BACKEND_PORT || 3000;
const elasticClient = new ElasticClient({
  node: process.env.ELASTIC_ENDPOINT || 'http://localhost:9200',
});

const ensureIndexTemplateExists = async () => {
  await elasticClient.indices.putIndexTemplate({
    name: templateName,
    body: template,
  });
};

const sendEntries = async (entries: ElasticStatEntry[], now: number) => {
  // nothing to send to the backend
  if (entries.length <= 0) {
    return;
  }

  // create index based on the date
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
  app.use(useragent.express());

  app.post('/', async (req, res) => {
    const date = new Date();
    const body = validateStatEntry(req.body);

    if (!body.valid) {
      console.log(
        date,
        '[ERROR]',
        util.inspect({ body: req.body, errors: body.errors }, false, null, true),
      );
      res.status(400).send({ success: false, errors: body.errors });
      return;
    }

    const { data } = body;
    const now = Date.now();
    const entries = createEntries(data, now, req.useragent);
    await sendEntries(entries, now);

    console.log(date, util.inspect(data, false, null, true));
    res.send({ success: true });
  });

  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
