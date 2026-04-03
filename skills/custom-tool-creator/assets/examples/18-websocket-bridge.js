// Example 18: WebSocket Bridge
// Demonstrates event-driven architecture with simulated events

// Note: For real WebSocket support, add 'ws' to package.json

module.exports = async function({ parameters, context }) {
  const { action, channel, message } = parameters;

  // Event store file
  const eventsDir = context.workspace.dataDir('websocket-events');
  const eventsFile = `${eventsDir}/events.json`;

  try { await context.fs.mkdir(eventsDir, { recursive: true }); } catch {}

  // Load events
  let events = [];
  try {
    const data = await context.fs.readFile(eventsFile, 'utf8');
    events = JSON.parse(data);
  } catch {
    events = [];
  }

  const result = { success: true, action, channel };

  switch (action) {
    case 'send':
      if (!channel || !message) {
        throw new Error('channel and message required for send action');
      }
      const event = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        channel,
        message,
        timestamp: new Date().toISOString()
      };
      events.push(event);
      // Keep only last 1000 events
      if (events.length > 1000) events = events.slice(-1000);
      await context.fs.writeFile(eventsFile, JSON.stringify(events, null, 2));
      result.eventId = event.id;
      break;

    case 'receive':
      const channelEvents = channel
        ? events.filter(e => e.channel === channel)
        : events;
      result.events = channelEvents.slice(-50); // last 50 events
      result.count = result.events.length;
      break;

    case 'subscribe':
      result.subscribed = true;
      result.channel = channel || 'default';
      result.message = 'Simulated WebSocket subscription (add ws library for real WS)';
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return result;
};

/**
 * Simulated WebSocket bridge for event-driven communication.
 * Stores events in filesystem for persistence.
 * For real-time WebSocket, integrate 'ws' library.
 *
 * Channels: logical grouping for messages
 * Actions: send, receive, subscribe
 */