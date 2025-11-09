# Admin Functions Documentation

## Overview

This document describes the comprehensive admin functions for managing product code approvals and rejections in the Tool Pal Network system. All functions are designed to work entirely through the database with proper transaction management, error handling, and audit trails.

## Core Functions

### 1. `approve_product_code_admin(product_code_id, admin_notes)`

**Purpose**: Approves a product code and creates the corresponding user subscription.

**Parameters**:
- `p_product_code_id` (UUID): The ID of the product code to approve
- `p_admin_notes` (TEXT, optional): Admin notes for the approval

**Returns**: JSONB object with detailed results

**What it does**:
1. Validates the product code exists and is in pending status
2. Updates the product code status to 'approved'
3. Creates a new user subscription with proper expiry date calculation
4. Updates the purchase request status based on remaining items
5. Returns comprehensive result information

**Example Usage**:
```sql
SELECT approve_product_code_admin(
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    'Payment verified via bank transfer'
);
```

**Response Example**:
```json
{
  "success": true,
  "message": "Product code approved successfully",
  "product_code_id": "123e4567-e89b-12d3-a456-426614174000",
  "subscription_id": "456e7890-e89b-12d3-a456-426614174001",
  "purchase_request_id": "789e0123-e89b-12d3-a456-426614174002",
  "purchase_request_status": "completed",
  "remaining_pending": 0,
  "total_items": 2,
  "approved_items": 2,
  "rejected_items": 0
}
```

### 2. `reject_product_code_admin(product_code_id, admin_notes)`

**Purpose**: Rejects a product code and updates related purchase request status.

**Parameters**:
- `p_product_code_id` (UUID): The ID of the product code to reject
- `p_admin_notes` (TEXT, optional): Admin notes for the rejection

**Returns**: JSONB object with detailed results

**What it does**:
1. Validates the product code exists and is in pending status
2. Updates the product code status to 'rejected'
3. Updates the purchase request status based on remaining items
4. Returns comprehensive result information

**Example Usage**:
```sql
SELECT reject_product_code_admin(
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    'Payment not received within 48 hours'
);
```

## Helper Functions

### 3. `get_purchase_request_summary(purchase_request_id)`

**Purpose**: Gets comprehensive information about a purchase request and all its items.

**Parameters**:
- `p_purchase_request_id` (UUID): The ID of the purchase request

**Returns**: JSONB object with purchase request details and item summaries

**Example Usage**:
```sql
SELECT get_purchase_request_summary('789e0123-e89b-12d3-a456-426614174002'::UUID);
```

### 4. `bulk_process_purchase_request(purchase_request_id, action, admin_notes)`

**Purpose**: Bulk approve or reject all pending product codes in a purchase request.

**Parameters**:
- `p_purchase_request_id` (UUID): The ID of the purchase request
- `p_action` (VARCHAR): Either 'approve' or 'reject'
- `p_admin_notes` (TEXT, optional): Admin notes for the bulk action

**Returns**: JSONB object with processing results

**Example Usage**:
```sql
-- Bulk approve all pending items
SELECT bulk_process_purchase_request(
    '789e0123-e89b-12d3-a456-426614174002'::UUID,
    'approve',
    'All payments verified'
);

-- Bulk reject all pending items
SELECT bulk_process_purchase_request(
    '789e0123-e89b-12d3-a456-426614174002'::UUID,
    'reject',
    'Payment deadline exceeded'
);
```

### 5. `get_admin_dashboard_stats()`

**Purpose**: Gets comprehensive statistics for the admin dashboard.

**Parameters**: None

**Returns**: JSONB object with various statistics

**Example Usage**:
```sql
SELECT get_admin_dashboard_stats();
```

**Response Example**:
```json
{
  "product_codes": {
    "total": 150,
    "pending": 25,
    "approved": 100,
    "rejected": 20,
    "expired": 5
  },
  "purchase_requests": {
    "total": 75,
    "pending": 10,
    "processing": 5,
    "completed": 55,
    "cancelled": 5
  },
  "user_subscriptions": {
    "total": 100,
    "active": 85,
    "expiring_soon": 10,
    "expired": 3,
    "cancelled": 2
  },
  "recent_activity": {
    "pending_codes_last_24h": 8,
    "approved_codes_last_24h": 12,
    "rejected_codes_last_24h": 2
  }
}
```

## Database Integration Features

### Automatic Status Updates

The functions automatically handle:

1. **Product Code Status**: Updates from 'pending' to 'approved' or 'rejected'
2. **Subscription Creation**: Creates user subscriptions with proper expiry dates
3. **Purchase Request Status**: Updates based on remaining pending items:
   - `processing`: Still has pending items
   - `completed`: All items processed (mixed results)
   - `cancelled`: All items rejected

### Transaction Management

- All operations are wrapped in transactions
- Automatic rollback on errors
- Comprehensive error handling with detailed error messages

### Audit Trail

- Tracks who approved/rejected (via `auth.uid()`)
- Records timestamps for all actions
- Maintains admin notes for all decisions
- Updates `updated_at` fields automatically

### Expiry Date Calculation

- Automatically calculates subscription expiry dates based on subscription period
- Supports: 1_month, 3_months, 6_months, 1_year, 2_years, lifetime
- Uses the existing `calculate_expiry_date()` function

## Error Handling

All functions return structured JSON responses with:

- `success`: Boolean indicating if the operation succeeded
- `error`: Error message if operation failed
- `message`: Success message if operation succeeded
- Additional context-specific fields

## Security

- All functions use `SECURITY DEFINER` for proper privilege escalation
- RLS (Row Level Security) policies are respected
- Only authenticated users with admin roles can execute these functions
- All operations are logged with user context

## Usage in Admin Panel

These functions are designed to be called from your admin panel application:

```javascript
// Example frontend usage
const approveProductCode = async (productCodeId, adminNotes) => {
  const { data, error } = await supabase.rpc('approve_product_code_admin', {
    p_product_code_id: productCodeId,
    p_admin_notes: adminNotes
  });
  
  if (data.success) {
    console.log('Approved successfully:', data.message);
    // Update UI with new status
  } else {
    console.error('Approval failed:', data.error);
  }
};
```

## Migration Notes

This migration replaces the previous simple approval/rejection functions with comprehensive versions that:

1. Handle all database operations atomically
2. Provide detailed feedback on operations
3. Support bulk operations for efficiency
4. Include comprehensive error handling
5. Maintain proper audit trails
6. Update related entities automatically

The functions are backward compatible in terms of basic functionality but provide much richer responses and better error handling.






