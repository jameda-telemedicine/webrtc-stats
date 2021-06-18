export const name = 'webrtc-stats';

export const template = {
  index_patterns: [
    `${name}-*`,
  ],
  template: {
    settings: {
      index: {
        number_of_replicas: '0',
      },
    },
    mappings: {
      properties: {
        tan: {
          type: 'keyword',
        },
        'stat.bytes': {
          type: 'long',
        },
        'conference.id': {
          type: 'keyword',
        },
        'stat.kind': {
          type: 'keyword',
        },
        '@timestamp': {
          format: 'strict_date_optional_time||epoch_millis',
          type: 'date_nanos',
        },
        'profile.id': {
          type: 'keyword',
        },
        'profile.type': {
          type: 'keyword',
        },
        'stat.type': {
          type: 'keyword',
        },
        'session.id': {
          type: 'keyword',
        },
        'session.domain': {
          type: 'keyword',
        },
        'stat.timestamp': {
          format: 'strict_date_optional_time||epoch_millis',
          type: 'date_nanos',
        },
        'stat.id': {
          type: 'keyword',
        },
        'stat.jitter': {
          type: 'double',
        },
        'stat.packets.lost': {
          type: 'long',
        },
        'stat.frame.height': {
          type: 'long',
        },
        'stat.frame.width': {
          type: 'long',
        },
        'session.browser.name': {
          type: 'keyword',
        },
        'session.browser.version': {
          type: 'keyword',
        },
        'session.os': {
          type: 'keyword',
        },
      },
    },
  },
  composed_of: [],
};
