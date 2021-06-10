/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as t from 'io-ts';
import { isLeft } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/PathReporter';
import useragent from 'express-useragent';

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
    jitter?: number;
    packets?: {
      lost?: number;
    };
    frame?: {
      height?: number;
      width?: number;
    };
  };
  conference: {
    id: string;
  };
  profile: {
    id: string;
    type: string;
  };
  session: {
    id: string;
    browser?: {
      name?: string;
      version?: string;
    };
    os?: string;
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

const PartialStat = t.partial({
  jitter: t.number,
  frameWidth: t.number,
  frameHeight: t.number,
  packetsLost: t.number,
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
  profileType: t.string,
  sessionId: t.string,
  conferenceId: t.string,
  stats: t.array(t.intersection([CommonStat, PartialStat])),
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
  ua?: useragent.Details,
): ElasticStatEntry[] => entries.stats.map((e) => {
  const entry: ElasticStatEntry = {
    tan: entries.tan,
    conference: {
      id: entries.conferenceId,
    },
    profile: {
      id: entries.profileId,
      type: entries.profileType,
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
  };

  if (e.jitter) {
    entry.stat.jitter = e.jitter;
  }

  if (e.frameHeight) {
    if (!entry.stat.frame) {
      entry.stat.frame = {};
    }
    entry.stat.frame.height = e.frameHeight;
  }

  if (e.frameWidth) {
    if (!entry.stat.frame) {
      entry.stat.frame = {};
    }
    entry.stat.frame.width = e.frameWidth;
  }

  if (e.packetsLost) {
    if (!entry.stat.packets) {
      entry.stat.packets = {};
    }
    entry.stat.packets.lost = e.packetsLost;
  }

  if (ua) {
    if (ua.browser) {
      if (!entry.session.browser) {
        entry.session.browser = {};
      }
      entry.session.browser.name = ua.browser;
    }

    if (ua.version) {
      if (!entry.session.browser) {
        entry.session.browser = {};
      }
      entry.session.browser.version = ua.version;
    }

    if (ua.os) {
      entry.session.os = ua.os;
    }
  }

  return entry;
});
