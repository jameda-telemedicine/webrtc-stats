/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { sendStats, StatisticsInput } from '.';

/**
 * Extends window object to add our properties.
 */
declare global {
  interface Window {
    JitsiMeetJS: {
      app?: Record<string, unknown> & { analyticsHandlers?: unknown[] },
    },
    APP: {
      conference: {
        roomName: string,
        _room: {
          p2p: boolean,
          rtc: {
            peerConnections: Map<unknown, {
              peerconnection: RTCPeerConnection,
            }>,
          },
          participants: {
            _id: string;
            _displayName: string,
          }[]
        },
        getMyUserId(): string,
        getLocalDisplayName(): string,
        getStats(): unknown,
      };
    }
  }
}

/**
 * Types from jitsi-meet.
 */

interface JitsiStatsEvent {
  type: string;
  name: string;
  action: string;
  actionSubject?: string;
  source?: string;
}

interface JitsiMeetAnalyticsHandlerOptions {
  whiteListedEvents: string[],
  blackListedEvents: string[],
}

/**
 * Custom types.
 */

interface ConferenceParticipant {
  id: string;
  displayName: string;
}

interface RoomInformations {
  room: {
    name: string,
  },
  user: {
    id: string,
    displayName: string,
  },
  participants: ConferenceParticipant[],
  p2p: boolean | null,
  stats: unknown,
}

/**
 * Returns the namespace for all global variables, functions, etc that we need.
 *
 * @returns {Object} The namespace.
 */
function getJitsiMeetGlobalNS() {
  if (!window.JitsiMeetJS) {
    window.JitsiMeetJS = {};
  }

  if (!window.JitsiMeetJS.app) {
    window.JitsiMeetJS.app = {};
  }

  return window.JitsiMeetJS.app;
}

/**
 * Analytics handler for Jitsi Meet that sends stats to our backend.
 */
export default class JitsiMeetAnalyticsHandler {
  _whiteListedEvents: string[];

  _blackListedEvents: string[];

  _enabled: boolean;

  _userProperties: Record<string, unknown>;

  _statsInterval: number;

  _userPropertiesString: string;

  metadata: Record<string, unknown>;

  backendWarningSent: boolean;

  sessionIdWarningSent: boolean;

  backendUrl?: string;

  backendPostMessageType: string;

  /**
     * Creates new instance of the custom handler.
     *
     * @param {Object} options -
     */
  constructor(options: JitsiMeetAnalyticsHandlerOptions) {
    this._whiteListedEvents = options.whiteListedEvents || [];
    this._blackListedEvents = options.blackListedEvents || [];
    this._userProperties = {};
    this._enabled = true;
    this._userPropertiesString = '';
    this.metadata = {};

    this.backendWarningSent = false;
    this.sessionIdWarningSent = false;
    this.backendUrl = undefined;
    this.backendPostMessageType = 'jitsi-meet-analytics-handler';

    this._statsInterval = window.setInterval(() => {
      this._sendStats();
    }, 2000);

    console.info('Successfully loaded JitsiMeetAnalyticsHandler.');

    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.type || data.type !== this.backendPostMessageType) {
          return;
        }

        if (data.metadata) {
          this.metadata = data.metadata;
        }

        if (data.backendUrl) {
          this.backendUrl = data.backendUrl;
        }

        if (data.backendPostMessageType) {
          this.backendPostMessageType = data.backendPostMessageType;
        }

        console.log('IFRAME; got event: ', event);
      } catch (e) {
        // do nothing
      }
    });
  }

  /**
   * Send statistics.
   *
   * @returns {void}
   */
  _sendStats(): void {
    const roomInformations = this._getRoomInformations();

    if (!roomInformations) {
      return;
    }

    const roomName = roomInformations.room.name;

    if (!roomName) {
      return;
    }

    let peerConnections: RTCPeerConnection[] = [];
    if (
      window.APP && window.APP.conference
      && window.APP.conference._room
      && window.APP.conference._room.rtc
      && window.APP.conference._room.rtc.peerConnections
    ) {
      peerConnections = Array
        .from(window.APP.conference._room.rtc.peerConnections.values())
        .map((pc) => pc.peerconnection);
    }

    const stats: StatisticsInput = {
      room: roomName,
      metadata: {
        ...this.metadata,
        sessionId: roomInformations?.user?.id,
        conferenceId: roomName,
      },
      peerConnections,
    };

    if (window.parent.location !== window.location) {
      window.parent.postMessage(JSON.stringify({
        type: this.backendPostMessageType,
      }), '*');
    }

    if (!this.backendUrl) {
      if (!this.backendWarningSent) {
        console.warn('JitsiMeetAnalyticsHandler disabled, no backendUrl set.');
        this.backendWarningSent = true;
      }
      return;
    }

    if (this.backendWarningSent) {
      console.info('JitsiMeetAnalyticsHandler enabled, got backendUrl.');
      this.backendWarningSent = false;
    }

    if (!stats?.metadata?.sessionId) {
      if (!this.sessionIdWarningSent) {
        console.warn('No sessionId for the moment… JitsiMeetAnalyticsHandler is disabled.');
        this.sessionIdWarningSent = true;
      }
      return;
    }

    if (this.sessionIdWarningSent) {
      console.info('JitsiMeetAnalyticsHandler enabled, got a sessionId.');
      this.sessionIdWarningSent = false;
    }

    sendStats(this.backendUrl || '', stats);
  }

  /**
   * Get room informations.
   *
   * @returns {null|Object}
   */
  _getRoomInformations(): RoomInformations | null {
    if (!window.APP || !window.APP.conference) {
      return null;
    }

    const app = window.APP;
    const { conference } = app;
    const room = conference._room;

    let participants: ConferenceParticipant[] = [];
    let p2p = null;

    if (room) {
      if (room.participants) {
        participants = Object.values(room.participants).map((p) => ({
          id: p._id,
          displayName: p._displayName,
        }));
      }

      if (Object.prototype.hasOwnProperty.call(room, 'p2p')) {
        p2p = room.p2p;
      }
    }

    return {
      room: {
        name: conference.roomName,
      },
      user: {
        id: conference.getMyUserId(),
        displayName: conference.getLocalDisplayName(),
      },
      participants,
      p2p,
      stats: conference.getStats(),
    };
  }

  /**
   * Sets the permanent properties for the current session.
   *
   * @param {Record<string, unknown>} userProps - The permanent portperties.
   * @returns {void}
   */
  setUserProperties(userProps: Record<string, unknown> = {}): void {
    if (!this._enabled) {
      return;
    }

    const filter = ['user_agent', 'callstats_name'];

    this._userPropertiesString = Object.keys(userProps)
      .filter((key) => filter.indexOf(key) === -1)
      .map((key) => `permanent_${key}=${userProps[key]}`)
      .join('&');
  }

  /**
   * This is the entry point of the API.
   *
   * @param {JitsiStatsEvent} event - The event in the format specified by
   * lib-jitsi-meet.
   * @returns {void}
   */
  sendEvent(event: JitsiStatsEvent): void {}

  /**
     * Extracts a name for the event from the event properties.
     *
     * @param {Object} event - The analytics event.
     * @returns {string} - The extracted name.
     */
  _extractName(event: JitsiStatsEvent): string {
    if (event.type === 'page') {
      return event.name;
    }

    const {
      action,
      actionSubject,
      source,
    } = event;

    let name = action;

    if (actionSubject && actionSubject !== action) {
      name = `${actionSubject}.${action}`;
    }
    if (source && source !== action) {
      name = `${source}.${name}`;
    }

    return name;
  }

  /**
   * Checks if an event should be ignored or not.
   *
   * @param {JitsiStatsEvent} event - The event.
   * @returns {boolean}
   */
  _shouldIgnore(event: JitsiStatsEvent): boolean {
    if (!event || !this._enabled) {
      return true;
    }

    const name = this._extractName(event);

    if (Array.isArray(this._whiteListedEvents)) {
      return this._whiteListedEvents.indexOf(name) === -1;
    }

    if (Array.isArray(this._blackListedEvents)) {
      return this._blackListedEvents.indexOf(name) !== -1;
    }

    return false;
  }
}

const globalNS = getJitsiMeetGlobalNS();

globalNS.analyticsHandlers = globalNS.analyticsHandlers || [];
globalNS.analyticsHandlers.push(JitsiMeetAnalyticsHandler);
