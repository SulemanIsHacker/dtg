// Webhook handler for refund request notifications
// This can be integrated with services like Discord, Slack, or WhatsApp

import { Webhook } from 'discord-webhook-node';

const webhook = new Webhook(process.env.DISCORD_WEBHOOK_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticketId, name, email, orderId, reason, description, proofCount } = req.body;

    // Discord notification
    const embed = {
      title: '🔔 New Refund Request',
      color: 0xff6b6b, // Red color
      fields: [
        {
          name: '📋 Ticket ID',
          value: ticketId,
          inline: true
        },
        {
          name: '👤 Customer',
          value: name,
          inline: true
        },
        {
          name: '📧 Email',
          value: email,
          inline: true
        },
        {
          name: '🛒 Order ID',
          value: orderId,
          inline: true
        },
        {
          name: '❓ Reason',
          value: reason.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          inline: true
        },
        {
          name: '📎 Proof Files',
          value: `${proofCount} files uploaded`,
          inline: true
        },
        {
          name: '📝 Description',
          value: description.length > 200 ? description.substring(0, 200) + '...' : description,
          inline: false
        }
      ],
      footer: {
        text: 'Toolsy Store Support System',
        icon_url: 'https://your-domain.com/logo.png'
      },
      timestamp: new Date().toISOString()
    };

    await webhook.send({
      username: 'Refund Bot',
      avatarURL: 'https://your-domain.com/bot-avatar.png',
      embeds: [embed]
    });

    // You can also send to other services:
    
    // Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 New Refund Request: ${ticketId}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*New Refund Request*\n\n*Customer:* ${name}\n*Email:* ${email}\n*Order ID:* ${orderId}\n*Reason:* ${reason}\n*Ticket ID:* ${ticketId}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View Request'
                  },
                  url: `${process.env.ADMIN_DASHBOARD_URL}/refund-requests/${ticketId}`,
                  style: 'primary'
                }
              ]
            }
          ]
        })
      });
    }

    // WhatsApp Business API (if you have it set up)
    if (process.env.WHATSAPP_ACCESS_TOKEN) {
      await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: process.env.SUPPORT_WHATSAPP_NUMBER,
          type: 'text',
          text: {
            body: `🔔 New Refund Request\n\nTicket: ${ticketId}\nCustomer: ${name}\nEmail: ${email}\nOrder: ${orderId}\nReason: ${reason}\n\nReview: ${process.env.ADMIN_DASHBOARD_URL}/refund-requests/${ticketId}`
          }
        })
      });
    }

    res.status(200).json({ success: true, message: 'Notifications sent' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}
