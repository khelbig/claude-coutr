# Dual-Write Architecture Pattern

## ❌ INCORRECT: Sequential Dependent Writes (Current Implementation)

```typescript
// WRONG - Firestore depends on PostgreSQL success
async createCustomer(data) {
  const transaction = await startTransaction();
  try {
    // Step 1: Write to PostgreSQL
    const customer = await postgresRepo.save(data);
    
    // Step 2: Only if PostgreSQL succeeds, write to Firestore
    await firestoreCollection.doc(customer.id).set(data);
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    // If PostgreSQL fails, Firestore never gets written
    // If Firestore fails, PostgreSQL gets rolled back
  }
}
```

**Problems:**
- Firestore write depends on PostgreSQL success
- PostgreSQL rollback if Firestore fails
- Tight coupling between databases
- Single point of failure

## ✅ CORRECT: Parallel Independent Writes (Requested Architecture)

```typescript
// CORRECT - Both databases written independently
async createCustomer(data) {
  const customerId = uuidv4();
  
  // PARALLEL WRITES - Neither depends on the other
  const [postgresResult, firestoreResult] = await Promise.allSettled([
    this.writeToPostgres(customerId, data),
    this.writeToFirestore(customerId, data)
  ]);

  // Log failures but don't block
  if (postgresResult.status === 'rejected') {
    logger.error('PostgreSQL write failed', postgresResult.reason);
  }
  
  if (firestoreResult.status === 'rejected') {
    logger.error('Firestore write failed', firestoreResult.reason);
  }

  // Only throw if BOTH fail
  if (postgresResult.status === 'rejected' && firestoreResult.status === 'rejected') {
    throw new Error('Both database writes failed');
  }

  // Return success if at least one succeeded
  return customerId;
}
```

**Benefits:**
- True parallel writes using `Promise.allSettled()`
- Neither database blocks the other
- Partial success is acceptable
- Resilient to single database failures
- Better performance (parallel vs sequential)

## Implementation Guidelines

### 1. Use Promise.allSettled() for Parallel Writes
```typescript
const [pgResult, fsResult] = await Promise.allSettled([
  postgresWrite(),
  firestoreWrite()
]);
```

### 2. Handle Partial Failures Gracefully
- Log failures for monitoring
- Don't throw unless both fail
- Consider eventual consistency reconciliation

### 3. Read Strategy
```typescript
async getCustomer(id) {
  // Try primary (PostgreSQL)
  const pgCustomer = await postgresRepo.findOne(id);
  if (pgCustomer) return pgCustomer;
  
  // Fallback to secondary (Firestore)
  const fsDoc = await firestore.doc(id).get();
  if (fsDoc.exists) {
    logger.warn('Data inconsistency detected', { id });
    return fsDoc.data();
  }
  
  return null;
}
```

### 4. Eventual Consistency
- Background job to reconcile differences
- Health checks to detect inconsistencies
- Metrics to track dual-write success rates

## Migration Path

1. **Phase 1**: Update CustomerService to use parallel writes
2. **Phase 2**: Add monitoring for write failures
3. **Phase 3**: Implement reconciliation job
4. **Phase 4**: Add health checks for data consistency

## Key Principles

1. **Independence**: Each database operates independently
2. **Resilience**: System continues if one database fails
3. **Performance**: Parallel writes are faster than sequential
4. **Monitoring**: Track and alert on failures
5. **Eventual Consistency**: Accept temporary inconsistencies

## Example Service Structure

```typescript
@injectable()
export class CustomerService {
  async createCustomer(data: CustomerCreateDto) {
    const id = uuidv4();
    
    // Parallel, independent writes
    const results = await Promise.allSettled([
      this.postgresWrite(id, data),
      this.firestoreWrite(id, data)
    ]);
    
    // Handle results
    this.logResults(results);
    
    if (this.bothFailed(results)) {
      throw new Error('Critical: Both databases failed');
    }
    
    return { id, status: this.getStatus(results) };
  }
  
  private getStatus(results) {
    const [pg, fs] = results;
    if (pg.status === 'fulfilled' && fs.status === 'fulfilled') {
      return 'complete';
    } else if (pg.status === 'fulfilled' || fs.status === 'fulfilled') {
      return 'partial';
    } else {
      return 'failed';
    }
  }
}
```

## Monitoring & Alerts

Set up monitoring for:
- Dual-write success rate
- Single database failure rate
- Data inconsistency detection
- Reconciliation job status

## Testing Strategy

```typescript
describe('Dual-Write Architecture', () => {
  it('should succeed when both databases succeed', async () => {
    // Test happy path
  });
  
  it('should succeed when only PostgreSQL succeeds', async () => {
    // Mock Firestore failure
    // Expect partial success
  });
  
  it('should succeed when only Firestore succeeds', async () => {
    // Mock PostgreSQL failure
    // Expect partial success
  });
  
  it('should fail only when both databases fail', async () => {
    // Mock both failures
    // Expect error
  });
});
```