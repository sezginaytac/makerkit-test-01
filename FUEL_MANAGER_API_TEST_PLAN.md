# Fuel Manager API Test Plan

## Overview
This document outlines the comprehensive testing strategy for the Fuel Manager API endpoints. The testing covers authentication, authorization, data validation, and error handling for all fuel manager related API routes.

## Test Environment
- **Framework**: Playwright E2E Testing
- **Language**: TypeScript
- **Test Runner**: Playwright Test Runner
- **Environment**: Development/Staging

## Test Categories

### 1. Authentication Tests
All API endpoints should return `401 Unauthorized` for requests without valid authentication.

**Test Cases:**
- [x] Unauthenticated GET requests return 401
- [x] Unauthenticated POST requests return 401
- [x] Unauthenticated PUT requests return 401
- [x] Unauthenticated DELETE requests return 401

### 2. Fuel Quality API Tests

#### 2.1 GET /api/fuel-manager/fuel-quality/list
**Purpose**: Retrieve all fuel quality data for the authenticated user

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 200 and empty array for authenticated user with no data
- [x] Returns 200 and data array for authenticated user with data
- [x] Handles database errors gracefully (500 status)

#### 2.2 POST /api/fuel-manager/fuel-quality/upload
**Purpose**: Upload fuel quality data files

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 400 for missing file
- [x] Returns 200 for valid file upload
- [x] Handles file validation errors
- [x] Handles storage upload errors
- [x] Handles database errors gracefully

#### 2.3 PUT /api/fuel-manager/fuel-quality/update
**Purpose**: Update existing fuel quality data

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 400 for invalid data
- [x] Returns 404 for non-existent records
- [x] Returns 200 for successful updates

#### 2.4 DELETE /api/fuel-manager/fuel-quality/delete
**Purpose**: Delete fuel quality data

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 404 for non-existent records
- [x] Returns 200 for successful deletion

### 3. Fuel Inventory API Tests

#### 3.1 GET /api/fuel-manager/fuel-inventory/fuel-types
**Purpose**: Retrieve available fuel types

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 200 and fuel types array for authenticated user

#### 3.2 GET /api/fuel-manager/fuel-inventory/port-names
**Purpose**: Retrieve available port names

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 200 and port names array for authenticated user

#### 3.3 GET /api/fuel-manager/fuel-inventory/ships-names
**Purpose**: Retrieve available ship names

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 200 and ship names array for authenticated user

#### 3.4 POST /api/fuel-manager/fuel-inventory/calculate-and-save
**Purpose**: Calculate and save fuel inventory data

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 400 for invalid data
- [x] Returns 200 for successful calculations
- [x] Handles calculation errors gracefully

### 4. Price Prediction API Tests

#### 4.1 GET /api/fuel-manager/price-prediction
**Purpose**: Retrieve all price prediction files

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 200 and files array for authenticated user
- [x] Returns 404 for users without accounts
- [x] Handles database errors gracefully

#### 4.2 POST /api/fuel-manager/price-prediction
**Purpose**: Upload price prediction files

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 400 for missing file
- [x] Returns 200 for successful upload
- [x] Handles file validation errors
- [x] Handles storage upload errors
- [x] Handles database errors gracefully

#### 4.3 GET /api/fuel-manager/price-prediction/active
**Purpose**: Retrieve active price prediction files

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 200 and active files array for authenticated user

#### 4.4 GET /api/fuel-manager/price-prediction/[id]/use
**Purpose**: Use a specific price prediction file

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 404 for non-existent files
- [x] Returns 200 for successful usage

#### 4.5 POST /api/fuel-manager/price-prediction/[id]/process
**Purpose**: Process a price prediction file

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 404 for non-existent files
- [x] Returns 200 for successful processing
- [x] Handles processing errors gracefully

#### 4.6 DELETE /api/fuel-manager/price-prediction/[id]/delete
**Purpose**: Delete a price prediction file

**Test Cases:**
- [x] Returns 401 for unauthenticated requests
- [x] Returns 404 for non-existent files
- [x] Returns 200 for successful deletion
- [x] Cleans up associated storage files

## Test Data Requirements

### Test Users
- **Standard User**: Regular authenticated user for basic functionality tests
- **Admin User**: User with elevated permissions for admin functionality tests

### Test Files
- **Valid CSV Files**: Properly formatted fuel quality and price prediction data
- **Invalid Files**: Malformed files to test error handling
- **Large Files**: Files exceeding size limits to test validation

### Test Database State
- **Empty State**: No fuel manager data to test empty responses
- **Populated State**: Sample data to test data retrieval and manipulation
- **Error State**: Corrupted data to test error handling

## Test Execution

### Running Tests
```bash
# Run all fuel manager tests
npm run test:e2e -- --grep "Fuel Manager"

# Run specific test category
npm run test:e2e -- --grep "Fuel Quality"
npm run test:e2e -- --grep "Fuel Inventory"
npm run test:e2e -- --grep "Price Prediction"

# Run with specific browser
npm run test:e2e -- --project=chromium
```

### Test Reports
- **HTML Report**: Generated after test execution
- **JUnit Report**: For CI/CD integration
- **Screenshots**: Captured on test failures
- **Video Recording**: Full test execution recording

## Known Issues

### Database Schema Issues
- **Missing Tables**: The `memberships` and `price_prediction_files` tables are not yet created in the database
- **Type Mismatches**: Supabase client types don't recognize fuel manager specific tables
- **RLS Policies**: Row-level security policies may not be configured for fuel manager tables

### API Implementation Issues
- **Import Errors**: Some API routes still reference deprecated Supabase client imports
- **Service Dependencies**: Fuel manager services may not be fully implemented
- **Error Handling**: Some endpoints may not handle all error cases gracefully

## Next Steps

### Phase 1: Database Setup (Priority: High)
1. Create missing database tables for fuel manager
2. Set up proper RLS policies
3. Update Supabase client types

### Phase 2: API Implementation (Priority: High)
1. Fix remaining import issues
2. Implement missing service methods
3. Add comprehensive error handling

### Phase 3: Test Enhancement (Priority: Medium)
1. Add integration tests with real database
2. Implement performance tests
3. Add security tests (SQL injection, XSS, etc.)

### Phase 4: Production Readiness (Priority: Low)
1. Load testing
2. Security audit
3. Documentation updates

## Success Criteria

### Test Coverage
- [ ] 100% API endpoint coverage
- [ ] 100% authentication test coverage
- [ ] 100% error handling test coverage
- [ ] 90%+ test pass rate

### Performance
- [ ] API response time < 500ms for simple operations
- [ ] API response time < 2s for complex operations
- [ ] File upload handling < 10s for 10MB files

### Security
- [ ] All endpoints properly authenticate users
- [ ] No sensitive data exposure in error messages
- [ ] Proper input validation and sanitization
- [ ] RLS policies enforce data access controls

## Conclusion

This test plan provides a comprehensive framework for testing the Fuel Manager API. The current implementation has some database schema and API integration issues that need to be resolved before all tests can pass. However, the test structure is in place and ready to validate the API once the underlying issues are fixed.

The tests focus on:
1. **Authentication & Authorization**: Ensuring only authenticated users can access the API
2. **Data Validation**: Proper handling of valid and invalid input data
3. **Error Handling**: Graceful degradation when things go wrong
4. **API Contract**: Consistent response formats and status codes

By following this test plan, we can ensure the Fuel Manager API is robust, secure, and ready for production use.
