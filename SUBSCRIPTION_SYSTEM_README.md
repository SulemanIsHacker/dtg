# Subscription Management System

A comprehensive subscription management dashboard where admins create permanent authentication codes for users, assign products with specific subscription periods, and users can view their subscriptions and request refunds.

## Features

### User Features
- **Permanent Authentication**: Users log in once with admin-provided authentication codes and stay logged in
- **Subscription Dashboard**: View all assigned products with subscription periods and remaining time
- **Status Tracking**: Clear visual indicators for active, expiring soon, and expired subscriptions
- **Duration Display**: Shows remaining time in years, months, or days
- **Refund Requests**: Submit refund requests for active subscriptions
- **Responsive Design**: Clean, user-friendly interface that works on all devices

### Admin Features
- **User Management**: Create users with name and email (email is unique identifier)
- **Permanent Auth Codes**: Generate unique, permanent authentication codes tied to email addresses
- **Subscription Assignment**: Assign one or multiple products with chosen subscription periods (1 month, 3 months, 1 year, etc.)
- **Subscription Management**: Edit, update, or remove product assignments
- **Refund Request Processing**: Review and approve/reject refund requests
- **Full Control**: View all users, their details, assigned products, and subscription periods

## Database Schema

The system uses the following main tables:

### `user_auth_codes`
- Stores permanent authentication codes for users
- Email is unique identifier (one code per email)
- No expiration dates - codes are permanent
- Includes user name and email information

### `user_subscriptions`
- Tracks user product subscriptions with specific periods
- Includes subscription type, period (1 month, 3 months, 1 year, etc.), and status
- Automatically calculates expiry dates based on subscription period
- Automatically updates status based on expiry date
- Includes admin notes for each subscription

### `subscription_refund_requests`
- Manages refund requests for subscriptions
- Includes reason, description, and admin processing status
- Links to specific subscriptions and user auth codes

## Usage

### For Users

1. **Access the Dashboard**: Navigate to `/subscriptions`
2. **Login**: Enter your permanent authentication code provided by the admin
3. **Stay Logged In**: Once logged in, you remain authenticated (no need to log in again)
4. **View Subscriptions**: See all your assigned products with subscription periods and remaining time
5. **Request Refunds**: Click "Request Refund" on active subscriptions
6. **Contact Support**: Use the built-in contact options for assistance

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Go to Subscriptions Tab**: Click on the "Subscriptions" tab
3. **Create Users**: Enter user name and email to generate permanent authentication code
4. **Assign Products**: Create subscriptions with specific periods (1 month, 3 months, 1 year, etc.)
5. **Manage Subscriptions**: Edit, update, or remove product assignments
6. **Process Refunds**: Review and approve/reject refund requests
7. **View All Users**: See complete user list with their subscriptions and status

## Status Indicators

- **🟢 Active**: Subscription is active and working
- **🟡 Expiring Soon**: Subscription expires within 7 days
- **🔴 Expired**: Subscription has expired
- **⚫ Cancelled**: Subscription has been cancelled

## Subscription Periods

The system supports the following subscription periods:
- **1 Month**: 30-day subscription
- **3 Months**: 90-day subscription
- **6 Months**: 180-day subscription
- **1 Year**: 365-day subscription
- **2 Years**: 730-day subscription
- **Lifetime**: Effectively permanent (100 years)

## API Endpoints

The system integrates with Supabase for data management:

- **Authentication**: Validates user codes and manages sessions
- **Subscriptions**: CRUD operations for user subscriptions
- **Refunds**: Manages refund request lifecycle
- **Real-time Updates**: Automatic status updates based on expiry dates

## Security

- **Row Level Security (RLS)**: Implemented on all tables
- **Admin-only Access**: Subscription management restricted to admin users
- **User Isolation**: Users can only access their own data
- **Permanent Authentication**: Code-based authentication with no expiration
- **Email Uniqueness**: Each email can only have one authentication code
- **Session Persistence**: Users stay logged in until they manually log out

## Installation

1. Run the database migration: `supabase/migrations/20250115000004_create_subscription_system.sql`
2. The system is automatically integrated into the existing admin panel
3. Access the user dashboard at `/subscriptions`
4. Access admin management at `/admin` → Subscriptions tab

## Customization

The system is built with modular components that can be easily customized:

- **Status Colors**: Modify color schemes in component files
- **Refund Reasons**: Update the reason options in `SubscriptionRefundModal.tsx`
- **Subscription Types**: Add new subscription types in the database schema
- **UI Components**: All components use shadcn/ui for consistent styling

## Support

For technical support or questions about the subscription system, contact the development team or refer to the main project documentation.
