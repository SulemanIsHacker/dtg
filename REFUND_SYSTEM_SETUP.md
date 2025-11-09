# Refund Request System Setup Guide

## Overview
This guide explains how to set up the complete refund request system that receives, processes, and manages customer refund requests.

## How the System Works

### 1. Customer Submits Request
- Customer fills out the refund form on your website
- Form data is validated and sent to `/api/refund-request`
- Files (screenshots/videos) are uploaded to Supabase storage
- Request is saved to database with unique ticket ID

### 2. You Receive Notifications
When a refund request is submitted, you'll receive notifications through:

#### Email Notifications
- **Customer**: Gets confirmation email with ticket ID
- **Support Team**: Gets detailed notification with all request details

#### Real-time Notifications (Optional)
- **Discord**: Rich embed with all request details
- **Slack**: Formatted message with action buttons
- **WhatsApp**: Direct message to support number

### 3. Admin Dashboard
- View all refund requests in one place
- Filter by status (pending, approved, rejected, etc.)
- Review proof files uploaded by customers
- Add admin notes and update request status
- Process refunds with amount and method tracking

## Setup Instructions

### 1. Database Setup
Run the migration to create the refund_requests table:
```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/20241201_create_refund_requests.sql
```

### 2. Environment Variables
Create a `.env.local` file with:
```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin Dashboard
ADMIN_DASHBOARD_URL=http://localhost:3000/admin

# Notifications (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your_slack_webhook
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
SUPPORT_WHATSAPP_NUMBER=+1234567890
```

### 3. API Endpoints
The system creates these endpoints:

#### `/api/refund-request` (POST)
- Receives refund form submissions
- Validates data and files
- Saves to database
- Sends email notifications
- Returns ticket ID

#### `/api/webhooks/refund-notification` (POST)
- Sends real-time notifications
- Discord, Slack, WhatsApp integration
- Called automatically after successful submission

#### `/api/admin/refund-requests` (GET)
- Returns all refund requests for admin dashboard
- Requires admin authentication

#### `/api/admin/refund-requests/[ticketId]` (PATCH)
- Updates request status
- Adds admin notes
- Sets refund amount and method

### 4. File Structure
```
api/
├── refund-request.js          # Main refund submission endpoint
├── webhooks/
│   └── refund-notification.js # Real-time notifications
└── admin/
    └── refund-requests.js     # Admin API endpoints

src/
├── pages/
│   └── RefundPolicy.tsx       # Customer refund form
└── components/
    └── RefundRequestAdmin.tsx # Admin dashboard

supabase/
└── migrations/
    └── 20241201_create_refund_requests.sql
```

## What You'll Receive

### Email Notifications
**Customer Confirmation:**
- Professional email template
- Ticket ID for tracking
- Expected response time
- Contact information

**Support Team Notification:**
- Complete request details
- Customer information
- Proof file count
- Direct link to admin dashboard

### Real-time Notifications
**Discord:**
- Rich embed with all details
- Color-coded by urgency
- Clickable links to admin panel

**Slack:**
- Formatted message blocks
- Action buttons for quick access
- Thread support for discussions

**WhatsApp:**
- Direct message to support number
- All key details in one message
- Link to admin dashboard

### Admin Dashboard Features
- **Request List**: All requests with status badges
- **Detailed View**: Complete customer and request information
- **File Management**: Download and review proof files
- **Status Updates**: Approve, reject, or mark as completed
- **Notes System**: Add internal notes for team collaboration
- **Refund Tracking**: Set amount and payment method
- **Customer Contact**: Direct email integration

## Request Flow

1. **Customer submits** → Form validation → API call
2. **System processes** → Database save → File upload → Email sent
3. **You get notified** → Email + Discord/Slack/WhatsApp
4. **You review** → Admin dashboard → Check proof files
5. **You decide** → Approve/Reject → Add notes → Set refund details
6. **Customer notified** → Status update email → Refund processed

## Security Features

- **File validation**: Only images and videos allowed
- **Size limits**: 10MB per file
- **Database security**: Row-level security policies
- **Admin authentication**: Required for dashboard access
- **Input validation**: All fields validated before processing

## Customization

### Email Templates
Modify the email templates in `api/refund-request.js`:
- Customer confirmation email
- Support team notification
- Status update emails

### Notification Channels
Add or remove notification channels in `api/webhooks/refund-notification.js`:
- Discord webhooks
- Slack integrations
- WhatsApp Business API
- Custom webhooks

### Form Fields
Add or modify form fields in `src/pages/RefundPolicy.tsx`:
- Additional customer information
- Custom refund reasons
- Extra validation rules

## Testing

1. **Submit test request** through the refund form
2. **Check email** for confirmation and notification
3. **Verify database** entry in Supabase
4. **Test admin dashboard** functionality
5. **Confirm file uploads** in storage bucket

## Support

The system is designed to be:
- **Scalable**: Handles multiple requests simultaneously
- **Reliable**: Error handling and fallback mechanisms
- **User-friendly**: Clear status messages and confirmations
- **Professional**: Branded emails and notifications

All refund requests are tracked with unique ticket IDs, making it easy to reference and follow up with customers.
