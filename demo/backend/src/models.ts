/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as t from 'io-ts';
import { isLeft } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/PathReporter';

export type TypeValidation<T> =
  | {
    valid: false;
    errors: string[];
  }
  | {
    valid: true;
    data: T;
  };

export type ElasticStatEntry = {
  tan: string;
  stat: {
    id: string;
    bytes: number;
    kind: string;
    type: string;
    timestamp: number;
  };
  conference: {
    id: string;
  };
  profile: {
    id: string;
  };
  session: {
    id: string;
  };
  '@timestamp': number;
};

const InboundStat = t.type({
  type: t.literal('inbound-rtp'),
  bytesReceived: t.number,
});

const OutboundStat = t.type({
  type: t.literal('outbound-rtp'),
  bytesSent: t.number,
});

const CommonStat = t.intersection([
  t.type({
    timestamp: t.number,
    id: t.string,
    kind: t.union([t.literal('audio'), t.literal('video')]),
  }),
  t.union([InboundStat, OutboundStat]),
]);

const StatEntry = t.type({
  tan: t.string,
  profileId: t.string,
  sessionId: t.string,
  conferenceId: t.string,
  stats: t.array(CommonStat),
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StatEntry = t.TypeOf<typeof StatEntry>;

export const validateStatEntry = (data: any): TypeValidation<StatEntry> => {
  const statEntry = StatEntry.decode(data);

  if (isLeft(statEntry)) {
    return {
      valid: false,
      errors: PathReporter.report(statEntry),
    };
  }

  return {
    valid: true,
    data: statEntry.right,
  };
};

export const createEntries = (
  entries: StatEntry,
  now: number,
): ElasticStatEntry[] => entries.stats.map((e) => ({
  tan: entries.tan,
  conference: {
    id: entries.conferenceId,
  },
  profile: {
    id: entries.profileId,
  },
  session: {
    id: entries.sessionId,
  },
  stat: {
    id: e.id,
    type: e.type,
    kind: e.kind,
    bytes: e.type === 'inbound-rtp' ? e.bytesReceived : e.bytesSent,
    timestamp: e.timestamp,
  },
  '@timestamp': now,
}));
