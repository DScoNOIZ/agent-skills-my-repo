// ~/.roo/tools/slack-notify.js
module.exports.slackNotify = {
  name: 'slack_notify',
  description: 'Send notification to Slack via webhook. Requires SLACK_WEBHOOK_URL in .env file.',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        maxLength: 4000,
        description: 'Message text (max 4000 chars)'
      },
      channel: {
        type: 'string',
        description: 'Override channel (if webhook allows)'
      },
      emoji: {
        type: 'string',
        default: 'robot',
        description: 'Emoji icon for message'
      }
    },
    required: ['message']
  },
  async execute({ message, channel, emoji = 'robot' }) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return 'Error: SLACK_WEBHOOK_URL not set in .env file. See documentation.';
    }

    const payload = {
      text: message,
      icon_emoji: emoji
    };

    if (channel) {
      payload.channel = channel;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        return `Slack error ${response.status}: ${await response.text()}`;
      }

      return 'Notification sent to Slack';

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
