export interface StatisticsInput {
  room: string,
  metadata: Record<string, unknown>,
}

/**
 * Send statistics to a backend.
 *
 * @param stats statistics to send.
 */
export const sendStats = (stats: StatisticsInput): void => {
  const roomName = stats.room;

  fetch(`http://localhost:3000/${roomName}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stats),
  });
};
