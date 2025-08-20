# Email Workflow Event Integration

## Current Status

The email workflow system currently supports:
- ✅ **Time-based triggers** - Working via cron schedules
- ✅ **Manual triggers** - Working via API calls
- ❌ **Event-based triggers** - NOT IMPLEMENTED
- ❌ **Condition-based triggers** - NOT IMPLEMENTED

## What Needs to Be Implemented

### 1. Connect EmailWorkflowService to EventEmitter

The `EmailWorkflowService` needs to:
1. Inject the `EventEmitter` service
2. Initialize event listeners for all active event-based workflows
3. Update listeners when workflows are created/updated/deleted

### 2. System Events That Need to Emit

Currently, only a few events are being emitted:
- `order.fulfilled`
- `order.paid`

The following events need to be added throughout the codebase:

#### Vendor Events
- `vendor.created` - When vendor account is created
- `vendor.approved` - When vendor is approved
- `vendor.suspended` - When vendor is suspended
- `vendor.onboarding_started` - When onboarding begins
- `vendor.onboarding_completed` - When onboarding completes
- `vendor.contract_expiring` - When contract is near expiry
- `vendor.payment_method_added` - When payment method is added

#### Order Events (partially implemented)
- `order.created` - When new order is placed
- ✅ `order.paid` - Already implemented
- ✅ `order.fulfilled` - Already implemented
- `order.delivered` - When order is delivered
- `order.cancelled` - When order is cancelled
- `order.refunded` - When order is refunded
- `order.returned` - When return is initiated

#### User Events
- `user.created` - When user account is created
- `user.logged_in` - When user logs in
- `user.password_reset_requested` - When password reset requested
- `user.email_verified` - When email is verified
- `user.role_changed` - When user role changes

#### Document Events
- `document.uploaded` - When document is uploaded
- `document.approved` - When document is approved
- `document.rejected` - When document is rejected
- `document.expiring` - When document is near expiry
- `document.expired` - When document expires
- `document.signed` - When document is signed

#### Auth Events
- `auth.login_failed` - When login fails
- `auth.suspicious_activity` - When suspicious activity detected
- `auth.mfa_enabled` - When 2FA is enabled

### 3. Implementation Plan

#### Step 1: Update EmailWorkflowService

```typescript
constructor(
  @inject(TYPES.PostgresService) private postgres: PostgresService,
  @inject(TYPES.Logger) private logger: Logger,
  @inject(TYPES.FirestoreService) private firestore: FirestoreService,
  @inject(TYPES.EmailHistory) private emailHistory: EmailHistoryService,
  @inject(TYPES.EmailTemplate) private emailTemplate: EmailTemplateService,
  @inject(TYPES.EventEmitter) private eventEmitter: EventEmitter // ADD THIS
) {
  setTimeout(() => {
    this.initializeScheduledWorkflows();
    this.initializeEventListeners(); // ADD THIS
  }, 1000);
}

private async initializeEventListeners(): Promise<void> {
  const workflows = await this.findAll({ isActive: true });
  
  for (const workflow of workflows) {
    if (workflow.trigger.type === TriggerType.EVENT_BASED && workflow.trigger.config.eventName) {
      this.eventEmitter.on(workflow.trigger.config.eventName, async (payload) => {
        await this.executeWorkflow(workflow.id, {
          triggerData: payload.data,
          entityId: payload.data.id,
          entityType: workflow.trigger.config.entityType
        });
      });
    }
  }
}
```

#### Step 2: Add Event Emissions

Example for vendor approval:
```typescript
// In vendor.service.ts
async approveVendor(vendorId: string): Promise<void> {
  // ... approval logic ...
  
  this.eventEmitter.emit('vendor.approved', {
    vendorId,
    vendor: vendorData,
    approvedBy: userId,
    approvedAt: new Date()
  });
}
```

#### Step 3: Implement Condition-Based Triggers

For condition-based triggers, create a cron job that:
1. Queries the database based on conditions
2. Executes workflows for matching records
3. Tracks which records have already triggered to avoid duplicates

### 4. Testing

Once implemented, test with:
1. Create a workflow with event trigger (e.g., `vendor.approved`)
2. Perform the action (approve a vendor)
3. Verify the workflow executes and sends the email

## Priority

High priority events to implement first:
1. `vendor.approved` - For onboarding workflows
2. `order.created` - For order confirmations
3. `document.expiring` - For document renewal reminders
4. `user.created` - For welcome emails