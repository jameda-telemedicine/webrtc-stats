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
        'stat.type': {
          type: 'keyword',
        },
        'session.id': {
          type: 'keyword',
        },
        'stat.timestamp': {
          format: 'strict_date_optional_time||epoch_millis',
          type: 'date_nanos',
        },
        'stat.id': {
          type: 'keyword',
        },
      },
    },
  },
  composed_of: [],
};
