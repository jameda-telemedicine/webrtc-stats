export interface StatisticsInput {
  room: string,
  metadata: Record<string, unknown>,
  peerConnections: RTCPeerConnection[],
}

const getStats = async (pc: RTCPeerConnection) => {
  const stats = await pc.getStats(null).then((s) => {
    const items: Record<string, unknown>[] = [];

    const statItems = [
      'kind',
      'jitter',
      'packetsLost',
      'frameHeight',
      'frameWidth',
    ];

    s.forEach((report) => {
      const item: Record<string, unknown> = {
        id: report.id,
        type: report.type,
        timestamp: report.timestamp,
      };
      Object.keys(report).forEach((statName) => {
        if (report.type === 'inbound-rtp') {
          if ([...statItems, 'bytesReceived'].includes(statName)) {
            item[statName] = report[statName];
          }
        } else if (report.type === 'outbound-rtp') {
          if ([...statItems, 'bytesSent'].includes(statName)) {
            item[statName] = report[statName];
          }
        }
      });

      if (['inbound-rtp', 'outbound-rtp'].includes(report.type)) {
        items.push(item);
      }
    });

    return {
      state: pc.connectionState,
      items,
    };
  });

  return stats;
};

/**
 * Send statistics to a backend.
 *
 * @param stats statistics to send.
 */
export const sendStats = async (backendUrl: string, stats: StatisticsInput): Promise<void> => {
  const roomName = stats.room;

  const pcStats = await Promise.all(stats.peerConnections.map((pc) => getStats(pc)));

  fetch(`${backendUrl}/${roomName}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...stats.metadata,
      stats: pcStats.map((s) => s.items).flat(),
    }),
  });
};
