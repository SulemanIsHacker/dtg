# Sales Analytics System

## Overview

The Sales Analytics system provides comprehensive tracking and visualization of subscription sales data, revenue trends, and business insights. It's designed to help administrators make data-driven decisions about their subscription business.

## Features

### 📊 **Analytics Dashboard**
- **Real-time Revenue Tracking**: Monitor total revenue, net revenue, and refunds
- **Subscription Metrics**: Track subscriptions sold, active vs expired subscriptions
- **Performance Indicators**: Average order value, refund rates, and growth trends

### 📈 **Interactive Charts & Visualizations**
- **Line Charts**: Revenue and subscription trends over time
- **Bar Charts**: Product-wise performance comparison
- **Pie Charts**: Revenue distribution by product
- **Responsive Design**: Charts adapt to different screen sizes

### 🗓️ **Flexible Date Filtering**
- **Quick Filters**: Last 7 days, 30 days, 90 days, 1 year
- **Custom Date Range**: Select any start and end date
- **Grouping Options**: Daily, weekly, monthly, yearly aggregation

### 📋 **Product Performance Analysis**
- **Product Comparison**: Revenue, subscriptions, and refunds by product
- **Subscription Type Analysis**: Shared, semi-private, private breakdown
- **Period Analysis**: Monthly, quarterly, yearly, lifetime subscriptions

### 📤 **Data Export**
- **CSV Export**: Download analytics data for external analysis
- **Formatted Reports**: Clean, structured data ready for spreadsheet analysis

## Database Schema

### Sales Analytics Table
```sql
CREATE TABLE sales_analytics (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    product_id UUID REFERENCES products(id),
    subscription_type VARCHAR(20),
    subscription_period VARCHAR(20),
    revenue DECIMAL(10,2),
    subscriptions_sold INTEGER,
    refunds_issued DECIMAL(10,2),
    refunds_count INTEGER,
    active_subscriptions INTEGER,
    expired_subscriptions INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Key Functions

#### `get_sales_analytics(start_date, end_date, group_by_period)`
Returns aggregated sales data for the specified date range and grouping period.

#### `get_product_sales_summary(start_date, end_date)`
Returns product-wise sales summary with revenue, subscriptions, and refunds.

#### `generate_daily_sales_analytics(target_date)`
Generates daily analytics data for a specific date.

#### `backfill_sales_analytics()`
Populates analytics data from existing subscription and refund records.

## Automatic Data Population

The system automatically populates analytics data through database triggers:

### Subscription Creation Trigger
- Fires when a new subscription is created
- Calculates revenue based on subscription type and period
- Updates daily analytics records

### Status Change Trigger
- Fires when subscription status changes (active/expired)
- Updates active/expired subscription counts
- Maintains accurate subscription metrics

### Refund Processing Trigger
- Fires when refunds are approved/completed
- Updates refund amounts and counts
- Maintains net revenue calculations

## Usage

### Accessing Analytics
1. Navigate to the Admin Panel
2. Click on the "Sales Analytics" tab
3. Use the backfill tool if needed for existing data

### Setting Date Ranges
1. Select a predefined range (7d, 30d, 90d, 1y)
2. Or choose "Custom" to set specific dates
3. Select grouping period (daily, weekly, monthly, yearly)

### Viewing Charts
- **Revenue Trend**: Shows revenue and subscription trends over time
- **Product Performance**: Bar chart comparing product sales
- **Product Distribution**: Pie chart showing revenue share by product

### Exporting Data
1. Click the "Export CSV" button
2. File downloads automatically with current date in filename
3. Data includes all visible metrics and date range

## Data Backfill

For existing installations with subscription data:

1. **Run Backfill**: Click "Run Analytics Backfill" in the Sales Analytics tab
2. **Process**: System processes all existing subscriptions and refunds
3. **Verify**: Check the completion message for processed records count
4. **Use**: Analytics data is now available for all historical data

## Pricing Calculation

The system uses the following pricing structure:

### Base Prices
- **Shared**: $5.00
- **Semi-Private**: $10.00  
- **Private**: $15.00

### Period Multipliers
- **1 Month**: 1.0x
- **3 Months**: 2.5x
- **6 Months**: 4.5x
- **1 Year**: 8.0x
- **2 Years**: 14.0x
- **Lifetime**: 25.0x

### Custom Pricing
- Admins can set custom prices for individual subscriptions
- Custom prices override default calculations
- Analytics tracks both default and custom pricing

## Performance Considerations

### Database Indexing
- Indexed on date, product_id, and subscription_type
- Optimized for date range queries
- Efficient aggregation queries

### Caching Strategy
- Real-time data updates through triggers
- No caching layer (always fresh data)
- Optimized database functions for performance

### Query Optimization
- Uses PostgreSQL window functions
- Efficient date range filtering
- Minimal data transfer with targeted queries

## Security

### Row Level Security (RLS)
- Only admin users can access analytics data
- Service role has full access for system operations
- User data is properly isolated

### Data Privacy
- No personal information in analytics tables
- Only aggregated business metrics
- Compliant with data protection requirements

## Troubleshooting

### Common Issues

#### No Data Showing
1. Check if backfill has been run
2. Verify date range selection
3. Ensure subscriptions exist in the selected period

#### Incorrect Revenue Calculations
1. Verify subscription pricing settings
2. Check for custom pricing overrides
3. Ensure refund data is properly recorded

#### Performance Issues
1. Check database indexes are created
2. Verify date range isn't too large
3. Consider using weekly/monthly grouping for large datasets

### Support
- Check database logs for trigger errors
- Verify RLS policies are correctly configured
- Ensure all migration files have been applied

## Future Enhancements

### Planned Features
- **Email Reports**: Automated daily/weekly/monthly reports
- **Advanced Filtering**: Filter by product category, subscription type
- **Comparative Analysis**: Year-over-year, month-over-month comparisons
- **Forecasting**: Predictive analytics for revenue trends
- **Custom Dashboards**: Configurable analytics widgets

### Integration Opportunities
- **External Analytics**: Google Analytics, Mixpanel integration
- **Business Intelligence**: Power BI, Tableau connectors
- **API Access**: REST API for external system integration
- **Webhook Support**: Real-time notifications for key metrics

## Technical Stack

- **Frontend**: React, TypeScript, Recharts
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, shadcn/ui
- **Date Handling**: date-fns
- **Charts**: Recharts library

## Migration Files

1. `20250115000007_create_sales_analytics.sql` - Core analytics schema
2. `20250115000008_populate_sales_analytics.sql` - Triggers and backfill functions

Apply these migrations in order to set up the analytics system.
