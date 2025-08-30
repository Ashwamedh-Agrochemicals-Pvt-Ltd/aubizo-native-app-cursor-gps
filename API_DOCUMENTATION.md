# Aubizo API Documentation

## Overview

This document provides comprehensive API documentation for the Aubizo application, including all endpoints, request/response formats, authentication requirements, and error handling.

## Recent Updates

### v3.1.0 - Inventory System Enhancement (August 29, 2025) ✅

**🎯 MAJOR UPDATE: Complete Inventory Management Overhaul**

#### ✅ Key Achievements:

- **Unified Calculation Logic**: All stock operations (IN, OUT, ADJUST) now use consistent calculation methods
- **Enhanced Stock Adjustment**: Implemented relative adjustments (increase/decrease) instead of absolute quantities
- **Dual Counting System**: Perfect support for both unit-based and case-based inventory management
- **Data Consistency**: `quantity_units` field maintains single source of truth for all calculations
- **Complete Testing**: 100% API coverage tested and verified working

#### 🔧 Technical Improvements:

- **Consistent Field Names**: Standardized `warehouse_id`, `product_id`, `packing_id`, `batch_id` across all APIs
- **Enhanced Display Logic**: Quantity type selection properly affects display format
- **Robust Validation**: Prevents negative stock, validates case operations
- **Comprehensive Logging**: Full audit trail with `adjustment_type` tracking
- **Transaction Safety**: Atomic operations prevent data corruption

#### 📊 New API Features:

**Stock Adjustment API (Enhanced):**

```json
{
  "adjustment_type": "increase", // NEW: increase/decrease
  "quantity_case_type": "case", // ENHANCED: Better display logic
  "quantity": 5, // Relative amount (not absolute)
  "reasons": "damaged", // ENHANCED: Predefined categories
  "remark": "Physical count" // Custom text
}
```

**Dual Counting System:**

- **Quantity Type**: Shows exact units (1235 units)
- **Case Type**: Shows fractional cases (123.5 cases)
- **Automatic Conversion**: Uses `ProductPacking.units_per_case`
- **Display Consistency**: Respects user's selection across all operations

#### 🚀 Migration Benefits:

- **Frontend Friendly**: Intuitive dropdown selections (Increase/Decrease)
- **Data Integrity**: Prevents calculation errors and negative stock
- **Scalability**: Supports complex multi-category inventory (200+ products)
- **User Experience**: Clear display of quantities in preferred format

#### 📋 Breaking Changes:

- **Old Format**: `{"new_quantity": 15}` → **New Format**: `{"adjustment_type": "increase", "quantity": 10}`
- **Field Names**: Updated for consistency across all inventory APIs
- **Display Logic**: Enhanced to respect `quantity_case_type` selection

### v1.2.0 - Stock Adjustment Enhancement (Previous)

- **BREAKING CHANGE**: Stock Adjustment API now uses relative adjustments instead of absolute quantities
- **Field Names**: Uses consistent field names (`warehouse_id`, `product_id`, `packing_id`, `batch_id`) like other inventory APIs
- **Migration**: Update frontend code to use new format; server validates and prevents negative stock

### v1.1.0 - Quantity/Case Functionality

- Added `quantity_case_type` field to all inventory operations
- Support for case-based and unit-based inventory management
- Automatic conversion between cases and units using `ProductPacking.units_per_case`
- Enhanced inventory logs with detailed quantity tracking

## Base URL

```
http://your-domain.com/
```

## Authentication

Most endpoints require authentication using Token-based authentication. Include the token in the Authorization header:

```
Authorization: Token your_auth_token_here
```

## Quick Reference for Frontend Developers

## Response Format

All API responses follow a consistent format:

```json
{
  "status": true/false,
  "message": "Success/Error message",
  "data": {} // Response data (when applicable)
}
```

---

## Authentication APIs (`/auth/`)

### 1. User Registration

**Endpoint:** `POST /auth/register/`
**Authentication:** Not required

**Request Body:**

```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

**Success Response (201):**

```json
{
  "status": true,
  "Message": "User Created Successfully."
}
```

**Error Responses:**

- **400 Bad Request:**

```json
{
  "status": false,
  "message": "username already exists"
}
```

```json
{
  "status": false,
  "message": "email already registered"
}
```

```json
{
  "status": false,
  "data": {
    "username": ["This field is required."],
    "password": ["This field is required."],
    "email": ["Enter a valid email address."]
  }
}
```

### 2. User Login

**Endpoint:** `POST /auth/login/`
**Authentication:** Not required

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**

```json
{
  "status": true,
  "data": {
    "token": "auth_token_string"
  },
  "message": "login successful"
}
```

**Headers:**

```
login_user_name: username
```

**Error Responses:**

- **400 Bad Request:**

```json
{
  "status": false,
  "data": {},
  "message": "invalid credentials"
}
```

```json
{
  "status": false,
  "data": {
    "username": ["This field is required."],
    "password": ["This field is required."]
  }
}
```

### 3. User Logout

**Endpoint:** `POST /auth/logout/`
**Authentication:** Required

**Request Body:** Empty

**Success Response (200):**

```json
{
  "status": true,
  "Message": "Logged out Successfully.."
}
```

**Error Responses:**

- **401 Unauthorized:** Invalid or missing token

---

## Core APIs (`/core/`)

### 1. Get States

**Endpoint:** `GET /core/api/states/`
**Authentication:** Not specified

**Request Parameters:** None

**Success Response (200):**

```json
[
  {
    "id": 1,
    "name": "State Name",
    "code": "STATE_CODE"
  }
]
```

### 2. Get Districts

**Endpoint:** `GET /core/api/districts/`
**Authentication:** Not specified

**Query Parameters:**

- `state_id` (required): ID of the state

**Success Response (200):**

```json
[
  {
    "id": 1,
    "name": "District Name",
    "state": 1
  }
]
```

### 3. Get Talukas

**Endpoint:** `GET /core/api/talukas/`
**Authentication:** Not specified

**Query Parameters:**

- `district_id` (required): ID of the district

**Success Response (200):**

```json
[
  {
    "id": 1,
    "name": "Taluka Name",
    "district": 1
  }
]
```

### 4. Daily Attendance Report

**Endpoint:** `GET /core/api/attendance/daily/`
**Authentication:** Required (CompanyUserPermission)

**Query Parameters:**

- `date` (required): Date in YYYY-MM-DD format
- `download` (optional): "csv", "excel", or "json" (default)

**Success Response (200):**

```json
{
  "summary": {
    "date": "2024-01-15",
    "total_employees": 50,
    "total_present": 45,
    "total_absent": 5,
    "total_full_day": 40,
    "total_half_day": 5,
    "attendance_percentage": 90.0
  },
  "attendance_data": [
    {
      "employee_id": 1,
      "employee_name": "John Doe",
      "punch_in_time": "09:00",
      "punch_out_time": "18:00",
      "working_hours": 8.5,
      "attendance_status": "Full Day",
      "date": "2024-01-15"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:**

```json
{
  "error": "Date parameter is required"
}
```

```json
{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

- **500 Internal Server Error:**

```json
{
  "error": "Error message"
}
```

### 5. Monthly Attendance Report

**Endpoint:** `GET /core/api/attendance/monthly/`
**Authentication:** Required (CompanyUserPermission)

**Query Parameters:**

- `month` (required): Month number (1-12)
- `year` (required): Year (e.g., 2024)
- `download` (optional): "csv", "excel", or "json" (default)

**Success Response (200):**

```json
{
  "summary": {
    "month": "January 2024",
    "working_days": 22,
    "total_employees": 50,
    "overall_attendance_percentage": 85.5,
    "total_present_days": 940,
    "total_possible_days": 1100
  },
  "attendance_data": [
    {
      "employee_id": 1,
      "employee_name": "John Doe",
      "total_working_days": 22,
      "present_days": 20,
      "absent_days": 2,
      "full_days": 18,
      "half_days": 2,
      "total_working_hours": 160.5,
      "average_daily_hours": 8.03,
      "attendance_percentage": 90.91
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:**

```json
{
  "error": "Month and year parameters are required"
}
```

```json
{
  "error": "Invalid month or year"
}
```

### 6. Custom Date Attendance Report

**Endpoint:** `GET /core/api/attendance/custom/`
**Authentication:** Required (CompanyUserPermission)

**Query Parameters:**

- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `download` (optional): "csv", "excel", or "json" (default)

---

## Dealer APIs (`/dealer/`)

### 1. Create Dealer

**Endpoint:** `POST /dealer/create/`
**Authentication:** Required (Bearer Token)

**Request Body:**

```json
{
  "shop_name": "ABC Electronics",
  "owner_name": "John Doe",
  "phone": "9876543210",
  "gst_number": "29ABCDE1234F1Z5",
  "billing_address": "123 Main St, Business District",
  "shipping_address": "456 Warehouse St, Industrial Area",
  "state_id": 1,
  "district_id": 5,
  "taluka_id": 12,
  "agreement_status": "active",
  "remark": "Premium dealer with good credit history",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

**Field Descriptions:**

- `shop_name`: Name of the dealer's shop/business
- `owner_name`: Name of the shop owner
- `phone`: Phone number (will be used for OTP verification)
- `gst_number`: GST registration number
- `billing_address`: Billing address
- `shipping_address`: Shipping/delivery address
- `state_id`: Foreign key to State model
- `district_id`: Foreign key to District model
- `taluka_id`: Foreign key to Taluka model
- `agreement_status`: Either "active" or "inactive"
- `remark`: Additional notes about the dealer
- `latitude`: GPS latitude for location tracking
- `longitude`: GPS longitude for location tracking

**Success Response (201 Created):**

```json
{
  "id": 15,
  "added_by": {
    "id": 3,
    "user": {
      "username": "manager1"
    },
    "company": 1
  },
  "shop_name": "ABC Electronics",
  "owner_name": "John Doe",
  "phone": "9876543210",
  "gst_number": "29ABCDE1234F1Z5",
  "billing_address": "123 Main St, Business District",
  "shipping_address": "456 Warehouse St, Industrial Area",
  "state": {
    "id": 1,
    "state_name": "Maharashtra"
  },
  "district": {
    "id": 5,
    "district_name": "Pune",
    "state": 1
  },
  "taluka": {
    "id": 12,
    "taluka_name": "Pune City",
    "district": 5
  },
  "agreement_status": "active",
  "remark": "Premium dealer with good credit history",
  "location_latitude": 18.5204,
  "location_longitude": 73.8567,
  "is_phone_verified": false,
  "phone_verified_at": null,
  "otp_status": {
    "has_pending_otp": false,
    "is_expired": false,
    "created_at": null
  },
  "company": 1
}
```

**Error Response (400 Bad Request):**

```json
{
  "field_name": ["Error message"],
  "phone": ["This field is required."],
  "gst_number": ["Enter a valid GST number."]
}
```

### 2. Get All Dealers

**Endpoint:** `GET /dealer/`
**Authentication:** Required (Bearer Token)

**Query Parameters:** None (returns all dealers for the authenticated user's company)

**Success Response (200 OK):**

```json
[
  {
    "id": 15,
    "added_by": {
      "id": 3,
      "user": {
        "username": "manager1"
      },
      "company": 1
    },
    "shop_name": "ABC Electronics",
    "owner_name": "John Doe",
    "phone": "9876543210",
    "gst_number": "29ABCDE1234F1Z5",
    "billing_address": "123 Main St, Business District",
    "shipping_address": "456 Warehouse St, Industrial Area",
    "state": {
      "id": 1,
      "state_name": "Maharashtra"
    },
    "district": {
      "id": 5,
      "district_name": "Pune"
    },
    "taluka": {
      "id": 12,
      "taluka_name": "Pune City"
    },
    "agreement_status": "active",
    "remark": "Premium dealer",
    "location_latitude": 18.5204,
    "location_longitude": 73.8567,
    "is_phone_verified": true,
    "phone_verified_at": "2025-08-19T10:30:45.123456Z",
    "otp_status": {
      "has_pending_otp": false,
      "is_expired": false,
      "created_at": "2025-08-19T10:25:30.123456Z"
    },
    "company": 1
  }
]
```

### 3. Get Dealer Detail

**Endpoint:** `GET /dealer/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Dealer ID (integer)

**Success Response (200 OK):** Same structure as individual dealer object in the list above.

**Error Response (404 Not Found):**

```json
{
  "detail": "Not found."
}
```

### 4. Update Dealer (Full Update)

**Endpoint:** `PUT /dealer/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Dealer ID

**Request Body:** Same as create request (all fields required)

**Success Response (200 OK):** Updated dealer object

### 5. Update Dealer (Partial Update)

**Endpoint:** `PATCH /dealer/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Dealer ID

**Request Body Example:**

```json
{
  "agreement_status": "inactive",
  "remark": "Updated status due to payment issues"
}
```

**Success Response (200 OK):** Updated dealer object

### 6. Delete Dealer

**Endpoint:** `DELETE /dealer/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Dealer ID

**Success Response (200 OK):**

```json
{
  "message": "Dealer deleted successfully."
}
```

### 7. Send OTP to Dealer

**Endpoint:** `POST /dealer/{dealer_id}/send-otp/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `dealer_id` (required): Dealer ID

**Request Body:** Empty `{}`

**Success Response (200 OK):**

```json
{
  "message": "OTP sent successfully",
  "dealer_id": 15,
  "phone": "9876543210",
  "otp_id": 23,
  "expires_in_minutes": 5
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Failed to send OTP: SMS service unavailable"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Error processing request: [error details]"
}
```

### 8. Verify Dealer OTP

**Endpoint:** `POST /dealer/{dealer_id}/verify-otp/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `dealer_id` (required): Dealer ID

**Request Body:**

```json
{
  "otp": "123456"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Phone number verified successfully",
  "dealer_id": 15,
  "verified_at": "2025-08-19T10:30:45.123456Z",
  "is_phone_verified": true
}
```

**Error Responses:**

**400 Bad Request - Missing OTP:**

```json
{
  "error": "OTP is required"
}
```

**400 Bad Request - Invalid OTP:**

```json
{
  "error": "Invalid OTP"
}
```

**400 Bad Request - Expired OTP:**

```json
{
  "error": "OTP has expired. Please request a new one."
}
```

**400 Bad Request - No pending OTP:**

```json
{
  "error": "No pending OTP found for this dealer"
}
```

### 9. Check OTP Status

**Endpoint:** `GET /dealer/{dealer_id}/otp-status/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `dealer_id` (required): Dealer ID

**Success Response (200 OK):**

```json
{
  "dealer_id": 15,
  "phone": "9876543210",
  "is_phone_verified": true,
  "phone_verified_at": "2025-08-19T10:30:45.123456Z",
  "has_pending_otp": false,
  "otp_created_at": "2025-08-19T10:25:30.123456Z",
  "is_otp_expired": true,
  "otp_verified": true
}
```

### 10. Daily Dealer Visit Report

**Endpoint:** `GET /dealer/api/visits/daily/`
**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `format` (optional): Response format - `json` (default), `csv`, or `excel`

**Example:** `/dealer/api/visits/daily/?date=2025-08-19&format=json`

**Success Response (200 OK) - JSON Format:**

```json
{
  "report_date": "2025-08-19",
  "total_dealers": 50,
  "visited_dealers": 12,
  "unvisited_dealers": 38,
  "visit_percentage": 24.0,
  "visited_dealer_details": [
    {
      "dealer_id": 15,
      "shop_name": "ABC Electronics",
      "owner_name": "John Doe",
      "phone": "9876543210",
      "location": {
        "latitude": 18.5204,
        "longitude": 73.8567
      },
      "visits": [
        {
          "visit_id": 45,
          "employee": "emp1",
          "visit_start_time": "2025-08-19T09:30:00",
          "visit_end_time": "2025-08-19T10:15:00",
          "duration_minutes": 45,
          "remark": "Product demo completed"
        }
      ],
      "total_visits_today": 1
    }
  ]
}
```

**Success Response - CSV/Excel Format:**
Returns downloadable file with visit data.

### 11. Monthly Dealer Visit Report

**Endpoint:** `GET /dealer/api/visits/monthly/`
**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `month` (optional): Month number 1-12 (defaults to current month)
- `year` (optional): Year YYYY (defaults to current year)
- `format` (optional): Response format - `json` (default), `csv`, or `excel`

**Example:** `/dealer/api/visits/monthly/?month=8&year=2025&format=json`

**Success Response (200 OK):**

```json
{
  "month": 8,
  "year": 2025,
  "month_name": "August",
  "total_dealers": 50,
  "dealers_visited_this_month": 45,
  "dealers_not_visited": 5,
  "total_visits": 156,
  "average_visits_per_dealer": 3.47,
  "daily_breakdown": [
    {
      "date": "2025-08-01",
      "visits": 8,
      "dealers_visited": 7
    },
    {
      "date": "2025-08-02",
      "visits": 12,
      "dealers_visited": 10
    }
  ],
  "top_visited_dealers": [
    {
      "dealer_id": 15,
      "shop_name": "ABC Electronics",
      "visit_count": 8,
      "last_visit": "2025-08-19T10:15:00"
    }
  ]
}
```

### 12. Custom Date Range Dealer Visit Report

**Endpoint:** `GET /dealer/api/visits/custom/`
**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `from_date` (required): Start date in YYYY-MM-DD format
- `to_date` (required): End date in YYYY-MM-DD format
- `format` (optional): Response format - `json` (default), `csv`, or `excel`

**Example:** `/dealer/api/visits/custom/?from_date=2025-08-01&to_date=2025-08-19&format=json`

**Success Response (200 OK):**

```json
{
  "from_date": "2025-08-01",
  "to_date": "2025-08-19",
  "period_days": 19,
  "total_dealers": 50,
  "dealers_visited": 47,
  "dealers_not_visited": 3,
  "total_visits": 284,
  "average_visits_per_day": 14.95,
  "dealer_visit_summary": [
    {
      "dealer_id": 15,
      "shop_name": "ABC Electronics",
      "owner_name": "John Doe",
      "total_visits": 6,
      "first_visit": "2025-08-02T09:30:00",
      "last_visit": "2025-08-19T10:15:00",
      "average_visit_duration_minutes": 38
    }
  ]
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "from_date cannot be after to_date."
}
```

## Dealer API Relationships & Data Models

### Dealer Model Fields:

- `id`: Primary key (auto-generated)
- `added_by`: Foreign key to CompanyUser (who created the dealer)
- `company`: Foreign key to Company (multi-tenant isolation)
- `shop_name`: CharField (max 125 chars)
- `owner_name`: CharField (max 125 chars)
- `phone`: CharField (max 15 chars, used for OTP)
- `gst_number`: CharField (max 125 chars)
- `billing_address`: TextField
- `shipping_address`: TextField
- `state`: Foreign key to State model
- `district`: Foreign key to District model
- `taluka`: Foreign key to Taluka model
- `agreement_status`: CharField with choices ["active", "inactive"]
- `remark`: TextField
- `is_phone_verified`: BooleanField (default False)
- `phone_verified_at`: DateTimeField (nullable)
- `location`: GenericRelation to Location model (stores GPS coordinates)

### Location Relationship:

- Each dealer can have GPS coordinates stored in the Location model
- Used for field tracking and nearby dealer searches
- Accessed via `dealer.location.first().latitude` and `dealer.location.first().longitude`

### OTP System:

- One-to-many relationship: Dealer → DealerOTP
- OTP expires after 5 minutes
- Phone verification status tracked on dealer model
- Latest OTP accessible via `dealer.otp_records.first()`

### Company Isolation:

- All dealer operations are automatically filtered by the authenticated user's company
- Ensures multi-tenant data separation
- No cross-company data access possible

### State/District/Taluka Hierarchy:

- State → District → Taluka relationship
- Foreign key relationships with SET_NULL on delete
- Provides geographical organization of dealers

---

---

## Farmer APIs (`/farmer/`)

### 1. Create Farmer

**Endpoint:** `POST /farmer/create/`
**Authentication:** Required

**Request Body:**

```json
{
  "farmer_name": "string",
  "phone": "string",
  "address": "string",
  "state": 1,
  "district": 1,
  "taluka": 1,
  "aadhaar_number": "string",
  "account_number": "string",
  "ifsc_code": "string",
  "land_area": "string",
  "crop_details": [
    {
      "crop_id": 1,
      "area": "5 acres",
      "irrigation_type": "drip"
    }
  ]
}
```

### 2. Get Farmers List

**Endpoint:** `GET /farmer/`
**Authentication:** Required

**Success Response (200):**

```json
{
  "count": 50,
  "next": "http://example.com/farmer/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "farmer_name": "Farmer Name",
      "phone": "1234567890",
      "address": "Farm Address",
      "state": {
        "id": 1,
        "name": "State Name"
      },
      "district": {
        "id": 1,
        "name": "District Name"
      },
      "taluka": {
        "id": 1,
        "name": "Taluka Name"
      },
      "aadhaar_number": "1234-5678-9012",
      "account_number": "123456789",
      "ifsc_code": "BANK0001234",
      "land_area": "10 acres"
    }
  ]
}
```

### 3. Get Farmer Detail

**Endpoint:** `GET /farmer/{id}/`
**Authentication:** Required

### 4. Get Crop Details

**Endpoint:** `GET /farmer/crop-details/`
**Authentication:** Required

### 5. Get Crops List

**Endpoint:** `GET /farmer/crops/`
**Authentication:** Required

### 6. Get Irrigation Types

**Endpoint:** `GET /farmer/irrigation-types/`
**Authentication:** Required

### 7. Update Farmer

**Endpoint:** `PUT /farmer/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Farmer ID

**Request Body:**

```json
{
  "farmer_name": "string",
  "phone": "string",
  "address": "string",
  "state": 1,
  "district": 1,
  "taluka": 1,
  "aadhaar_number": "string",
  "account_number": "string",
  "ifsc_code": "string",
  "land_area": "string",
  "crop_details": [
    {
      "crop_id": 1,
      "area": "5 acres",
      "irrigation_type": "drip"
    }
  ]
}
```

### 8. Partial Update Farmer

**Endpoint:** `PATCH /farmer/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Farmer ID

**Request Body:** (Any of the farmer fields to update)

### 9. Delete Farmer

**Endpoint:** `DELETE /farmer/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Farmer ID

**Success Response (204):**

```json
{
  "message": "Farmer deleted successfully."
}
```

### 10. Daily Farmer Visit Report

**Endpoint:** `GET /farmer/api/visits/daily/`
**Authentication:** Required (CompanyUserPermission)

**Query Parameters:**

- `date` (required): Date in YYYY-MM-DD format
- `download` (optional): "csv", "excel", or "json" (default)

**Success Response (200):**

```json
{
  "summary": {
    "date": "2024-01-15",
    "total_employees": 10,
    "employees_with_visits": 8,
    "employees_without_visits": 2,
    "active_employees": 8,
    "total_visits": 15,
    "total_unique_farmers_visited": 12,
    "average_visits_per_employee": 1.5,
    "activity_rate": 80.0
  },
  "visit_data": [
    {
      "employee_id": 1,
      "employee_name": "John Doe",
      "total_visits": 2,
      "unique_farmers_visited": 2,
      "assigned_farmers": 8,
      "visit_percentage": 25.0,
      "frequency_status": "Moderate",
      "engagement_level": "Low Engagement",
      "farmer_visits": [
        {
          "farmer_id": 1,
          "farmer_name": "Farmer Name",
          "mobile_no": "1234567890",
          "city": "City Name",
          "total_acre": 5.0,
          "visit_time": "10:30",
          "visit_duration": "30 minutes",
          "remark": "Good meeting"
        }
      ],
      "date": "2024-01-15"
    }
  ]
}
```

### 11. Monthly Farmer Visit Report

**Endpoint:** `GET /farmer/api/visits/monthly/`
**Authentication:** Required (CompanyUserPermission)

**Query Parameters:**

- `month` (required): Month number (1-12)
- `year` (required): Year (e.g., 2024)
- `download` (optional): "csv", "excel", or "json" (default)

### 12. Custom Date Farmer Visit Report

**Endpoint:** `GET /farmer/api/visits/custom/`
**Authentication:** Required (CompanyUserPermission)

**Query Parameters:**

- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `download` (optional): "csv", "excel", or "json" (default)

---

## Field Tracking APIs (`/track/`)

### 1. Punch In

**Endpoint:** `POST /track/punch-in/`
**Authentication:** Required

**Request Body:**

```json
{
  "latitude": 12.345678,
  "longitude": 78.901234,
  "location_address": "Current location address"
}
```

**Success Response (201):**

```json
{
  "status": true,
  "message": "Punched in successfully",
  "data": {
    "id": 1,
    "inpunch_date": "2024-01-15",
    "inpunch_time": "09:00:00",
    "latitude": 12.345678,
    "longitude": 78.901234,
    "location_address": "Current location address"
  }
}
```

### 2. Punch Out

**Endpoint:** `POST /track/punch-out/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Punch record ID

**Request Body:**

```json
{
  "latitude": 12.345678,
  "longitude": 78.901234,
  "location_address": "Current location address"
}
```

**Success Response (200):**

```json
{
  "status": true,
  "message": "Punched out successfully",
  "data": {
    "id": 1,
    "inpunch_date": "2024-01-15",
    "inpunch_time": "09:00:00",
    "out_punch_date": "2024-01-15",
    "out_punch_time": "18:00:00",
    "total_working_hours": 9.0
  }
}
```

### 3. Get User Location

**Endpoint:** `POST /track/get_user_lat_lon/`
**Authentication:** Required

**Request Body:**

```json
{
  "lat": 12.345678,
  "lon": 78.901234,
  "distance_m": 10
}
```

**Success Response (200):**

```json
{
  "nearby_farmers": [
    {
      "id": 1,
      "farmer_name": "Farmer Name",
      "mobile_no": "1234567890",
      "distance": 1.8
    }
  ],
  "nearby_dealers": [
    {
      "id": 1,
      "shop_name": "ABC Store",
      "owner_name": "John Doe",
      "phone": "1234567890",
      "distance": 2.5
    }
  ],
  "search_radius_meters": 10,
  "user_location": {
    "latitude": 12.345678,
    "longitude": 78.901234
  }
}
```

### 4. Nearby Dealers

**Endpoint:** `POST /track/nearby-dealers/`
**Authentication:** Required

**Request Body:**

```json
{
  "lat": 12.345678,
  "lon": 78.901234,
  "distance_m": 3
}
```

**Success Response (200):**

```json
{
  "dealers": [
    {
      "id": 1,
      "shop_name": "ABC Store",
      "owner_name": "John Doe",
      "phone": "1234567890",
      "distance": 2.5,
      "location_id": 123
    }
  ],
  "count": 1,
  "user_location": {
    "lat": 12.345678,
    "lon": 78.901234
  },
  "radius_meters": 3
}
```

### 5. Nearby Farmers

**Endpoint:** `POST /track/nearby-farmers/`
**Authentication:** Required

**Request Body:**

```json
{
  "lat": 12.345678,
  "lon": 78.901234,
  "distance_m": 10
}
```

**Success Response (200):**

```json
{
  "farmers": [
    {
      "id": 1,
      "farmer_name": "Farmer Name",
      "mobile_no": "1234567890",
      "distance": 1.8,
      "location_id": 456
    }
  ],
  "count": 1,
  "user_location": {
    "lat": 12.345678,
    "lon": 78.901234
  },
  "radius_meters": 10
}
```

### 6. Start Visit

**Endpoint:** `POST /track/start-visit/`
**Authentication:** Required

**Request Body:**

```json
{
  "punch_id": 123,
  "location_id": 456
}
```

**Success Response (201):**

```json
{
  "visit_id": 789,
  "message": "Visit started successfully"
}
```

### 7. End Visit

**Endpoint:** `PATCH /track/end-visit/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Visit ID

**Request Body:**

```json
{
  "remark": "Visit completed successfully"
}
```

**Success Response (200):**

```json
{
  "id": 789,
  "visit_start_time": "2024-01-15T10:30:00Z",
  "visit_end_time": "2024-01-15T11:15:00Z",
  "remark": "Visit completed successfully",
  "location": {
    "id": 456,
    "entity_name": "ABC Store"
  }
}
```

### 8. Visit History

**Endpoint:** `GET /track/visit-history/{location_id}/`
**Authentication:** Required

**Path Parameters:**

- `location_id` (required): Location ID

**Success Response (200):**

```json
{
  "entity": "ABC Store",
  "location_id": 456,
  "visit_history": [
    {
      "visit_start_time": "2024-01-15T10:30:00Z",
      "remark": "Successful visit",
      "employee": "john_doe"
    }
  ]
}
```

### 9. Routes

**Endpoint:** `GET /track/routes/`
**Authentication:** Required

**Query Parameters:**

- `from_date` (optional): Start date filter (YYYY-MM-DD, defaults to today)
- `to_date` (optional): End date filter (YYYY-MM-DD, defaults to today)
- `employee_id` (optional): Filter by specific employee ID

**Success Response (200):**

```json
{
  "routes": [
    {
      "employee_id": 1,
      "employee_name": "John Doe",
      "date": "2024-01-15",
      "punch_in_time": "09:00:00",
      "punch_out_time": "18:00:00",
      "total_working_hours": 9.0,
      "total_distance": 25.5,
      "visits": [
        {
          "location_type": "dealer",
          "location_name": "ABC Store",
          "visit_start_time": "10:30:00",
          "visit_end_time": "11:15:00",
          "distance_from_previous": 5.2,
          "remark": "Successful visit"
        }
      ]
    }
  ]
}
```

### 10. Check Punch Status

**Endpoint:** `GET /track/punch-in/`
**Authentication:** Required

**Success Response (200):**

```json
{
  "punched_in": true,
  "punched_out": false,
  "punch_id": 123
}
```

---

## Product APIs (`/product/`)

### 1. Get Products

**Endpoint:** `GET /product/products/`
**Authentication:** Required

**Query Parameters:**

- `category` (optional): Filter by category ID
- `search` (optional): Search in product name/description

**Success Response (200):**

```json
{
  "count": 25,
  "next": "http://example.com/product/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product description",
      "category": {
        "id": 1,
        "name": "Category Name"
      },
      "price": "100.00",
      "image": "http://example.com/media/product_images/product1.jpg",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Create Product

**Endpoint:** `POST /product/products/create/`
**Authentication:** Required

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "category": 1,
  "price": "100.00",
  "image": "file_upload",
  "is_active": true
}
```

### 3. Get Product Detail

**Endpoint:** `GET /product/products/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Product ID

**Success Response (200):**

```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "category": {
    "id": 1,
    "name": "Category Name"
  },
  "price": "100.00",
  "image": "http://example.com/media/product_images/product1.jpg",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 4. Update Product

**Endpoint:** `PUT /product/products/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Product ID

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "category": 1,
  "price": "100.00",
  "image": "file_upload",
  "is_active": true
}
```

### 5. Delete Product

**Endpoint:** `DELETE /product/products/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Product ID

**Success Response (204):**

```json
{
  "message": "Product deleted successfully."
}
```

### 6. Product Categories

**Endpoint:** `GET /product/categories/`
**Authentication:** Required

**Success Response (200):**

```json
[
  {
    "id": 1,
    "name": "Category Name",
    "description": "Category description",
    "is_active": true
  }
]
```

### 7. Create Product Category

**Endpoint:** `POST /product/categories/`
**Authentication:** Required

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "is_active": true
}
```

### 8. Get Product Category Detail

**Endpoint:** `GET /product/categories/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Category ID

### 9. Update Product Category

**Endpoint:** `PUT /product/categories/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Category ID

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "is_active": true
}
```

### 10. Delete Product Category

**Endpoint:** `DELETE /product/categories/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Category ID

**Success Response (204):**

```json
{
  "message": "Category deleted successfully."
}
```

### 11. Product Packings

**Endpoint:** `GET /product/packing/`
**Authentication:** Required

**Success Response (200):**

```json
[
  {
    "id": 1,
    "product": {
      "id": 1,
      "name": "Product Name"
    },
    "packing_size": "1kg",
    "price": "50.00",
    "is_active": true
  }
]
```

### 12. Create Product Packing

**Endpoint:** `POST /product/packing/`
**Authentication:** Required

**Request Body:**

```json
{
  "product": 1,
  "packing_size": "string",
  "price": "50.00",
  "is_active": true
}
```

### 13. Get Product Packing Detail

**Endpoint:** `GET /product/packing/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Packing ID

### 14. Update Product Packing

**Endpoint:** `PUT /product/packing/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Packing ID

### 15. Delete Product Packing

**Endpoint:** `DELETE /product/packing/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Packing ID

---

## Inventory APIs (`/inventory/`)

### Recent Updates (v3.1 - August 29, 2025)

**✅ ALL INVENTORY APIS FULLY TESTED AND WORKING**

#### Key Features:

- **Unified Calculation Logic**: All stock operations (IN, OUT, ADJUST) now use consistent calculation logic
- **Dual Counting System**: Support for both unit-based and case-based inventory management
- **Data Consistency**: `quantity_units` always stores the source of truth in units
- **Enhanced Display Logic**: Respects user's `quantity_case_type` selection for display
- **Complete Audit Trail**: All operations logged with detailed tracking
- **Multi-Warehouse Support**: Full warehouse management with stock transfers
- **Validation & Security**: Prevents negative stock, validates case operations

#### Calculation Logic:

- **Quantity Type**: Shows exact units (1235 units)
- **Case Type**: Shows fractional cases (123.5 cases)
- **Internal Storage**: `quantity_units` field maintains accurate unit count
- **Conversion**: Cases automatically converted using `ProductPacking.units_per_case`

### Field Structure (Updated v3.1)

#### Enhanced Quantity/Case Fields:

- **`quantity_case_type`** (string, required): Input type selection:
  - `"quantity"` - Input as individual units (displays as units)
  - `"case"` - Input as cases (displays as fractional cases)
- **`quantity`** (float, required): User input value in selected type
- **`quantity_units`** (integer, read-only): Always stores final quantity in units (source of truth)
- **`units_per_case`** (integer, read-only): From ProductPacking for case conversion

#### Enhanced Adjustment Fields:

- **`adjustment_type`** (string, required for adjustments): Adjustment direction:
  - `"increase"` - Add to current stock
  - `"decrease"` - Subtract from current stock
- **`remark`** (string, optional): Custom remark text
- **`reasons`** (string, optional): Predefined reason categories:
  - `"damaged"` - Damaged
  - `"expired"` - Expired
  - `"sales_return"` - Sales Return
  - `"replacement"` - Replacement
  - `"other"` - Other

#### Consistent Field Names:

All inventory APIs use standardized field names:

- `warehouse_id` (not `warehouse`)
- `product_id` (not `product`)
- `packing_id` (not `packing`)
- `batch_id` (not `batch`)

### 1. List Warehouses

**Endpoint:** `GET /inventory/warehouses/`
**Authentication:** Required

**Success Response (200):**

```json
[
  {
    "id": 1,
    "company": {
      "id": 1,
      "name": "Company Name"
    },
    "name": "Main Warehouse",
    "location": "123 Industrial Area, City",
    "added_by": {
      "id": 1,
      "username": "user123"
    }
  }
]
```

### 2. Create Warehouse

**Endpoint:** `POST /inventory/warehouses/`
**Authentication:** Required

**Request Body:**

```json
{
  "name": "New Warehouse",
  "location": "456 Storage Ave, City"
}
```

### 3. Warehouse Details/Update/Delete

#### Get Warehouse Details

**Endpoint:** `GET /inventory/warehouses/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Warehouse ID

**Success Response (200):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "ABC Agro Company",
    "contact_person": "John Doe",
    "email": "john@abcagro.com",
    "phone": "1234567890"
  },
  "name": "Main Warehouse",
  "location": "Industrial Area, Sector 5, City Name - 123456",
  "added_by": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "warehouse_admin",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@company.com"
    },
    "role": "inventory_manager"
  }
}
```

**Error Response (404):**

```json
{
  "detail": "Not found."
}
```

#### Update Warehouse (Full)

**Endpoint:** `PUT /inventory/warehouses/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Warehouse ID

**Request Body:**

```json
{
  "name": "Updated Warehouse Name",
  "location": "New Industrial Area, Sector 10, City Name - 654321"
}
```

**Success Response (200):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "ABC Agro Company",
    "contact_person": "John Doe",
    "email": "john@abcagro.com",
    "phone": "1234567890"
  },
  "name": "Updated Warehouse Name",
  "location": "New Industrial Area, Sector 10, City Name - 654321",
  "added_by": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "warehouse_admin",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@company.com"
    },
    "role": "inventory_manager"
  }
}
```

**Error Response (400):**

```json
{
  "name": ["This field is required."],
  "location": ["This field may not be blank."]
}
```

#### Update Warehouse (Partial)

**Endpoint:** `PATCH /inventory/warehouses/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Warehouse ID

**Request Body:** (Any subset of warehouse fields)

```json
{
  "name": "Partially Updated Name"
}
```

**Success Response (200):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "ABC Agro Company",
    "contact_person": "John Doe",
    "email": "john@abcagro.com",
    "phone": "1234567890"
  },
  "name": "Partially Updated Name",
  "location": "Industrial Area, Sector 5, City Name - 123456",
  "added_by": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "warehouse_admin",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@company.com"
    },
    "role": "inventory_manager"
  }
}
```

#### Delete Warehouse

**Endpoint:** `DELETE /inventory/warehouses/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Warehouse ID

**Success Response (204):**

```json
{
  "message": "Warehouse deleted successfully."
}
```

**Error Response (400):**

```json
{
  "error": "Cannot delete warehouse with existing stock records."
}
```

**Error Response (404):**

```json
{
  "detail": "Not found."
}
```

### 4. List Batches

**Endpoint:** `GET /inventory/batches/`
**Authentication:** Required

**Query Parameters:**

- `product_id` (optional): Filter by product ID
- `expiry_status` (optional): `expired`, `expiring_soon`

**Success Response (200):**

```json
[
  {
    "id": 1,
    "company": {
      "id": 1,
      "name": "Company Name"
    },
    "product": {
      "id": 1,
      "name": "Product Name"
    },
    "packing": {
      "id": 1,
      "packing_size": "1L"
    },
    "batch_no": "BATCH001",
    "manufacture_date": "2025-01-01",
    "expiry_date": "2026-01-01",
    "added_by": {
      "id": 1,
      "username": "user123"
    }
  }
]
```

### 5. Batch Management

#### Create Batch

**Endpoint:** `POST /inventory/batches/`
**Authentication:** Required

**Request Body:**

```json
{
  "product_id": 1,
  "packing_id": 1,
  "batch_no": "BATCH001-2025",
  "manufacture_date": "2025-01-15",
  "expiry_date": "2026-01-15"
}
```

**Success Response (201):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "ABC Agro Company",
    "contact_person": "John Doe",
    "email": "john@abcagro.com",
    "phone": "1234567890"
  },
  "product": {
    "id": 1,
    "name": "Insecticide XYZ",
    "description": "Effective pest control solution",
    "category": {
      "id": 1,
      "name": "Insecticides"
    },
    "company": 1
  },
  "packing": {
    "id": 1,
    "product": 1,
    "packing_size": "1L",
    "units_per_case": 12,
    "mrp": "500.00"
  },
  "batch_no": "BATCH001-2025",
  "manufacture_date": "2025-01-15",
  "expiry_date": "2026-01-15",
  "added_by": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "batch_admin",
      "first_name": "Batch",
      "last_name": "Manager",
      "email": "batch@company.com"
    },
    "role": "inventory_manager"
  }
}
```

**Error Response (400):**

```json
{
  "product_id": ["This field is required."],
  "packing_id": ["This field is required."],
  "batch_no": [
    "Batch with this batch number already exists for this product and packing."
  ],
  "expiry_date": ["Expiry date cannot be before manufacture date."]
}
```

#### Get Batch Details

**Endpoint:** `GET /inventory/batches/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Batch ID

**Success Response (200):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "ABC Agro Company",
    "contact_person": "John Doe",
    "email": "john@abcagro.com",
    "phone": "1234567890"
  },
  "product": {
    "id": 1,
    "name": "Insecticide XYZ",
    "description": "Effective pest control solution",
    "category": {
      "id": 1,
      "name": "Insecticides"
    },
    "company": 1
  },
  "packing": {
    "id": 1,
    "product": 1,
    "packing_size": "1L",
    "units_per_case": 12,
    "mrp": "500.00"
  },
  "batch_no": "BATCH001-2025",
  "manufacture_date": "2025-01-15",
  "expiry_date": "2026-01-15",
  "added_by": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "batch_admin",
      "first_name": "Batch",
      "last_name": "Manager",
      "email": "batch@company.com"
    },
    "role": "inventory_manager"
  }
}
```

**Error Response (404):**

```json
{
  "detail": "Not found."
}
```

#### Update Batch

**Endpoint:** `PUT /inventory/batches/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Batch ID

**Request Body:**

```json
{
  "product_id": 1,
  "packing_id": 1,
  "batch_no": "BATCH001-2025-UPDATED",
  "manufacture_date": "2025-01-15",
  "expiry_date": "2026-06-15"
}
```

**Success Response (200):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "ABC Agro Company",
    "contact_person": "John Doe",
    "email": "john@abcagro.com",
    "phone": "1234567890"
  },
  "product": {
    "id": 1,
    "name": "Insecticide XYZ",
    "description": "Effective pest control solution",
    "category": {
      "id": 1,
      "name": "Insecticides"
    },
    "company": 1
  },
  "packing": {
    "id": 1,
    "product": 1,
    "packing_size": "1L",
    "units_per_case": 12,
    "mrp": "500.00"
  },
  "batch_no": "BATCH001-2025-UPDATED",
  "manufacture_date": "2025-01-15",
  "expiry_date": "2026-06-15",
  "added_by": {
    "id": 1,
    "user": {
      "id": 1,
      "username": "batch_admin",
      "first_name": "Batch",
      "last_name": "Manager",
      "email": "batch@company.com"
    },
    "role": "inventory_manager"
  }
}
```

**Error Response (400):**

```json
{
  "batch_no": [
    "Batch with this batch number already exists for this product and packing."
  ],
  "non_field_errors": ["Cannot update batch that has stock transactions."]
}
```

#### Delete Batch

**Endpoint:** `DELETE /inventory/batches/{id}/`
**Authentication:** Required

**Path Parameters:**

- `id` (required): Batch ID

**Success Response (204):**

```json
{
  "message": "Batch deleted successfully."
}
```

**Error Response (400):**

```json
{
  "error": "Cannot delete batch with existing stock records or transactions."
}
```

**Error Response (404):**

```json
{
  "detail": "Not found."
}
```

### 6. List Warehouse Stocks

**Endpoint:** `GET /inventory/stocks/`
**Authentication:** Required

**Query Parameters:**

- `warehouse_id` (optional): Filter by warehouse ID
- `product_id` (optional): Filter by product ID
- `packing_id` (optional): Filter by packing ID
- `batch_id` (optional): Filter by batch ID
- `low_stock` (optional): `true` - Show items with quantity <= 10
- `zero_stock` (optional): `true` - Show items with zero quantity

**Success Response (200):**

```json
[
  {
    "id": 1,
    "company": {
      "id": 1,
      "name": "Company Name"
    },
    "warehouse": {
      "id": 1,
      "name": "Main Warehouse"
    },
    "product": {
      "id": 1,
      "name": "Product Name"
    },
    "packing": {
      "id": 1,
      "packing_size": "1L",
      "units_per_case": 10
    },
    "batch": {
      "id": 1,
      "batch_no": "BATCH001",
      "expiry_date": "2026-01-01"
    },
    "quantity_case_type": "case",
    "quantity": 123.5,
    "quantity_units": 1235,
    "updated_at": "2025-08-29T10:30:00Z"
  }
]
```

**Response Field Descriptions:**

- `quantity_case_type`: Display type ("quantity" shows units, "case" shows cases)
- `quantity`: Display value in selected type (123.5 cases or 1235 units)
- `quantity_units`: Actual stock in units (always accurate source of truth)

### 7. Stock Details/Update

**Endpoints:**

- `GET /inventory/stocks/{id}/` - Get stock details
- `PATCH /inventory/stocks/{id}/` - Update stock

### 8. Add Stock (Stock In) ✅

**Endpoint:** `POST /inventory/stocks/in/`
**Authentication:** Required

**Request Body:**

```json
{
  "warehouse_id": 1,
  "product_id": 20,
  "packing_id": 2,
  "batch_id": 1,
  "quantity_case_type": "case",
  "quantity": 5,
  "remark": "Purchase order received",
  "reasons": "other"
}
```

**Alternative (Unit-based):**

```json
{
  "warehouse_id": 1,
  "product_id": 20,
  "packing_id": 2,
  "batch_id": 1,
  "quantity_case_type": "quantity",
  "quantity": 50,
  "remark": "Direct unit addition",
  "reasons": "other"
}
```

**Success Response (200):**

```json
{
  "message": "Stock added successfully",
  "stock": {
    "id": 1,
    "quantity_case_type": "case",
    "quantity": 15.5,
    "quantity_units": 155,
    "updated_at": "2025-08-29T10:30:00Z"
  }
}
```

### 9. Remove Stock (Stock Out) ✅

**Endpoint:** `POST /inventory/stocks/out/`
**Authentication:** Required

**Request Body:**

```json
{
  "warehouse_id": 1,
  "product_id": 20,
  "packing_id": 2,
  "batch_id": 1,
  "quantity_case_type": "case",
  "quantity": 2,
  "remark": "Sale to dealer",
  "reasons": "sales_return"
}
```

**Error Response (400) - Insufficient Stock:**

```json
{
  "error": "Insufficient stock. Available: 10 units"
}
```

### 10. Adjust Stock ✅

**Endpoint:** `POST /inventory/stocks/adjust/`
**Authentication:** Required

**Request Body (Increase):**

```json
{
  "warehouse_id": 1,
  "product_id": 20,
  "packing_id": 2,
  "batch_id": 1,
  "adjustment_type": "increase",
  "quantity_case_type": "case",
  "quantity": 5,
  "remark": "Physical count adjustment",
  "reasons": "damaged"
}
```

**Request Body (Decrease):**

```json
{
  "warehouse_id": 1,
  "product_id": 20,
  "packing_id": 2,
  "batch_id": 1,
  "adjustment_type": "decrease",
  "quantity_case_type": "quantity",
  "quantity": 10,
  "remark": "Stock reduction",
  "reasons": "damaged"
}
```

**Success Response (200):**

```json
{
  "message": "Stock adjusted successfully",
  "stock": {
    "id": 1,
    "quantity_case_type": "case",
    "quantity": 20.5,
    "quantity_units": 205,
    "updated_at": "2025-08-29T11:00:00Z"
  }
}
```

**Error Responses:**

```json
{
  "error": "Insufficient stock. Current stock: 5 units, tried to decrease by: 10 units"
}
```

```json
{
  "error": "adjustment_type must be either \"increase\" or \"decrease\""
}
```

### 11. List Inventory Logs

**Endpoint:** `GET /inventory/logs/`
**Authentication:** Required

**Query Parameters:**

- `warehouse_id` (optional): Filter by warehouse ID
- `product_id` (optional): Filter by product ID
- `inventory_type` (optional): `in`, `out`, `adjustment`, `transfer`
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Success Response (200):**

```json
[
  {
    "id": 1,
    "company": {
      "id": 1,
      "name": "Company Name"
    },
    "product_name": "Product Name",
    "warehouse_name": "Main Warehouse",
    "batch_no": "BATCH001",
    "packing_size": "1L",
    "inventory_type": "adjustment",
    "inventory_type_display": "Adjustment",
    "adjustment_type": "increase",
    "quantity_case_type": "case",
    "quantity": 5,
    "quantity_units": 50,
    "units_per_case": 10,
    "previous_stock": 100,
    "new_stock": 150,
    "reasons": "other",
    "remark": "Physical count adjustment",
    "timestamp": "2025-08-29T11:30:00Z",
    "added_by": {
      "id": 1,
      "username": "user123"
    }
  }
]
```

### 12. Inventory Log Details

**Endpoint:** `GET /inventory/logs/{id}/`
**Authentication:** Required

### 13. Transfer Stock Between Warehouses ✅

**Endpoint:** `POST /inventory/stock/transfer/`
**Authentication:** Required

**Request Body:**

```json
{
  "from_warehouse": 1,
  "to_warehouse": 2,
  "product": 20,
  "packing": 2,
  "batch": 1,
  "quantity_case_type": "case",
  "quantity": 2
}
```

**Success Response (200):**

```json
{
  "message": "Stock transferred successfully",
  "from_warehouse": 1,
  "to_warehouse": 2,
  "quantity_transferred": 2,
  "quantity_units_transferred": 20,
  "from_stock_remaining": 180,
  "to_stock_total": 20,
  "transfer_id": 123
}
```

**Error Responses:**

```json
{
  "error": "Source and destination warehouse cannot be the same."
}
```

```json
{
  "error": "Insufficient stock in source warehouse."
}
```

### 14. Utility APIs

**Get Warehouses (Minimal):**

- `GET /inventory/warehouses/minimal/`

**Get Batches (Minimal):**

- `GET /inventory/batches/minimal/?product_id=20`

**Get Stock Summary:**

- `GET /inventory/summary/`

**Get Product Packings for Stock Out:**

- `GET /inventory/stock-out/packings/?product_id=20`

**Get Product Packing Batches:**

- `GET /inventory/stock/batches/?packing_id=2`

### 15. Frontend Integration Guide

#### Dropdown Selections:

**Quantity/Case Type:**

```html
<select name="quantity_case_type">
  <option value="quantity">Units</option>
  <option value="case">Cases</option>
</select>
```

**Adjustment Type:**

```html
<select name="adjustment_type">
  <option value="increase">Increase Stock</option>
  <option value="decrease">Decrease Stock</option>
</select>
```

**Reason Categories:**

```html
<select name="reasons">
  <option value="">No reason selected</option>
  <option value="damaged">Damaged</option>
  <option value="expired">Expired</option>
  <option value="sales_return">Sales Return</option>
  <option value="replacement">Replacement</option>
  <option value="other">Other</option>
</select>
```

#### Display Logic:

```javascript
// Display stock based on quantity_case_type
const formatStockDisplay = (stock) => {
  if (stock.quantity_case_type === "case") {
    return `${stock.quantity} cases (${stock.quantity_units} units)`;
  }
  return `${stock.quantity_units} units`;
};

// Handle quantity input based on type selection
const handleQuantityTypeChange = (type, unitsPerCase) => {
  const label = type === "case" ? "Cases" : "Units";
  document.getElementById("quantity-label").textContent = label;

  // Show conversion helper
  if (type === "case") {
    document.getElementById(
      "conversion-help"
    ).textContent = `1 case = ${unitsPerCase} units`;
  }
};
```

### 16. Error Handling

**Common Error Responses:**

```json
{
  "error": "warehouse_id is required"
}
```

```json
{
  "error": "Cannot use case type when units_per_case is 0"
}
```

```json
{
  "error": "Stock not found for the specified criteria"
}
```

### 17. Testing Status ✅

**All APIs Tested (August 29, 2025):**

- ✅ Warehouse Management (7/7 endpoints)
- ✅ Batch Management (5/5 endpoints)
- ✅ Stock Operations (3/3 core endpoints)
- ✅ Inventory Logging (2/2 endpoints)
- ✅ Utility Functions (5/5 endpoints)
- ✅ Both quantity and case types
- ✅ Complete workflow validation
- ✅ Data consistency verification

**System Status: 🟢 PRODUCTION READY**

---

## Tenant/Company Management APIs (`/api/`)

### 1. Register Company

**Endpoint:** `POST /api/register-company/`
**Authentication:** Not required

**Request Body:**

```json
{
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "subscription_plan": 1,
  "admin_user": {
    "username": "string",
    "password": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

### 2. Company Users Management

**Endpoint:** `GET /api/company-users-crud/`
**Authentication:** Required

**Success Response (200):**

```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "username": "user1",
        "email": "user1@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "company": {
        "id": 1,
        "name": "Company Name"
      },
      "role": {
        "id": 1,
        "name": "Manager"
      },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 3. Create Company User

**Endpoint:** `POST /api/company-users-crud/`
**Authentication:** Required

**Request Body:**

```json
{
  "user": {
    "username": "string",
    "password": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  },
  "role": 1,
  "is_active": true
}
```

### 4. Send Company OTP

**Endpoint:** `POST /api/companies/{id}/send-otp/`
**Authentication:** Required

### 5. Verify Company OTP

**Endpoint:** `POST /api/companies/{id}/verify-otp/`
**Authentication:** Required

**Request Body:**

```json
{
  "otp": "123456"
}
```

### 6. Send Company Email OTP

**Endpoint:** `POST /api/companies/{id}/send-email-otp/`
**Authentication:** Required

### 7. Verify Company Email OTP

**Endpoint:** `POST /api/companies/{id}/verify-email-otp/`
**Authentication:** Required

### 8. User Management

**Endpoint:** `GET /api/users/`
**Authentication:** Required

**Success Response (200):**

```json
[
  {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true
  }
]
```

### 9. Create User

**Endpoint:** `POST /api/users/`
**Authentication:** Required

### 10. Get User Detail

**Endpoint:** `GET /api/users/{id}/`
**Authentication:** Required

### 11. Update User

**Endpoint:** `PUT /api/users/{id}/`
**Authentication:** Required

### 12. User Profile

**Endpoint:** `GET /api/users/profile/`
**Authentication:** Required

### 13. User Company Context

**Endpoint:** `GET /api/users/{user_id}/context/`
**Authentication:** Required

### 14. Subscription Plans

**Endpoint:** `GET /api/subscription-plans/`
**Authentication:** Required

### 15. Create Subscription Plan

**Endpoint:** `POST /api/subscription-plans/`
**Authentication:** Required

### 16. Get Subscription Plan Detail

**Endpoint:** `GET /api/subscription-plans/{id}/`
**Authentication:** Required

### 17. Update Subscription Plan

**Endpoint:** `PUT /api/subscription-plans/{id}/`
**Authentication:** Required

### 18. Subscription Plan with Modules

**Endpoint:** `GET /api/subscription-plans/{id}/modules/`
**Authentication:** Required

### 19. Companies List

**Endpoint:** `GET /api/companies/`
**Authentication:** Required

### 20. Create Company

**Endpoint:** `POST /api/companies/`
**Authentication:** Required

### 21. Get Company Detail

**Endpoint:** `GET /api/companies/{id}/`
**Authentication:** Required

### 22. Update Company

**Endpoint:** `PUT /api/companies/{id}/`
**Authentication:** Required

**Endpoint:** `PATCH /api/companies/{id}/`
**Authentication:** Required

### 23. Company with Users

**Endpoint:** `GET /api/companies/{id}/users/`
**Authentication:** Required

### 24. Company Roles

**Endpoint:** `GET /api/companies/{company_id}/roles/`
**Authentication:** Required

### 25. Company Users by Company

**Endpoint:** `GET /api/companies/{company_id}/company-users/`
**Authentication:** Required

### 26. Company Users Active

**Endpoint:** `GET /api/company-users-active/`
**Authentication:** Required

### 27. Company Users Active by Company

**Endpoint:** `GET /api/companies/{company_id}/users-active/`
**Authentication:** Required

### 28. Roles Management

**Endpoint:** `GET /api/roles/`
**Authentication:** Required

### 29. Create Role

**Endpoint:** `POST /api/roles/`
**Authentication:** Required

### 30. Get Role Detail

**Endpoint:** `GET /api/roles/{id}/`
**Authentication:** Required

### 31. Update Role

**Endpoint:** `PUT /api/roles/{id}/`
**Authentication:** Required

### 32. Role with Permissions

**Endpoint:** `GET /api/roles/{id}/permissions/`
**Authentication:** Required

### 33. Company User Detail

**Endpoint:** `GET /api/company-users/{id}/`
**Authentication:** Required

### 34. Update Company User

**Endpoint:** `PUT /api/company-users/{id}/`
**Authentication:** Required

### 35. Company User Password Update

**Endpoint:** `PUT /api/company-users-crud/{id}/password/`
**Authentication:** Required

### 36. Company User Role Update

**Endpoint:** `PUT /api/company-users-crud/{id}/role/`
**Authentication:** Required

### 37. Company User Status Update

**Endpoint:** `PUT /api/company-users-crud/{id}/status/`
**Authentication:** Required

### 38. Modules Management

**Endpoint:** `GET /api/modules/`
**Authentication:** Required

### 39. Create Module

**Endpoint:** `POST /api/modules/`
**Authentication:** Required

### 40. Get Module Detail

**Endpoint:** `GET /api/modules/{id}/`
**Authentication:** Required

### 41. Update Module

**Endpoint:** `PUT /api/modules/{id}/`
**Authentication:** Required

### 42. Permissions by Role

**Endpoint:** `GET /api/permissions/role/{role_id}/`
**Authentication:** Required

### 43. Permissions by User

**Endpoint:** `GET /api/permissions/user/{user_id}/`
**Authentication:** Required

### 44. Check User Permission

**Endpoint:** `GET /api/check-permission/{user_id}/{module_code}/{action}/`
**Authentication:** Required

### 45. All Module Permissions

**Endpoint:** `GET /api/auth/all-module-permissions/`
**Authentication:** Required

### 46. User Permission Overrides

**Endpoint:** `GET /api/user-permission-overrides/`
**Authentication:** Required

### 47. Create User Permission Override

**Endpoint:** `POST /api/user-permission-overrides/`
**Authentication:** Required

### 48. User Permission Override Detail

**Endpoint:** `GET /api/user-permission-overrides/{id}/`
**Authentication:** Required

### 49. User Permission Overrides by User

**Endpoint:** `GET /api/users/{user_id}/permission-overrides/`
**Authentication:** Required

### 50. Bulk User Permission Overrides

**Endpoint:** `POST /api/users/{user_id}/permission-overrides/bulk/`
**Authentication:** Required

### 51. User Effective Permissions

**Endpoint:** `GET /api/users/{user_id}/effective-permissions/`
**Authentication:** Required

---

## Employee APIs (`/employee/`)

### 1. Dashboard Redirect

**Endpoint:** `GET /employee/employee/`
**Authentication:** Required

**Success Response (200):**
Returns "Driver" if user is in Driver group, otherwise returns "Hello"

---

## Error Codes

### HTTP Status Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Authentication required or invalid
- **403 Forbidden:** Permission denied
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

### Common Error Response Format

```json
{
  "status": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message for this field"]
  }
}
```

### Authentication Errors

```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "detail": "Invalid token."
}
```

### Validation Errors

```json
{
  "status": false,
  "data": {
    "field_name": ["This field is required."],
    "email": ["Enter a valid email address."],
    "phone": ["Ensure this field has at most 15 characters."]
  }
}
```

---

## Rate Limiting

- Standard rate limit: 1000 requests per hour per user
- Authentication endpoints: 10 requests per minute per IP

## Data Formats

- **Dates:** YYYY-MM-DD (ISO 8601)
- **DateTime:** YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC)
- **Phone numbers:** Maximum 15 characters
- **Coordinates:** Decimal degrees (e.g., 12.345678)

---

## Mobile Dashboard APIs (`/fieldtrack/dashboard/`)

### 1. Dashboard Statistics (Daily/Monthly/Custom)

**Endpoint:** `GET /fieldtrack/dashboard/stats/`
**Authentication:** Required
**Description:** Comprehensive dashboard statistics with flexible date range support for mobile app.

**Query Parameters:**

- `view_type` (optional): View type - `daily`, `monthly`, or `custom` (default: `daily`)
- `from_date` (required for custom): Start date in YYYY-MM-DD format
- `to_date` (required for custom): End date in YYYY-MM-DD format

**Examples:**

- Daily view: `/fieldtrack/dashboard/stats/?view_type=daily`
- Monthly view: `/fieldtrack/dashboard/stats/?view_type=monthly`
- Custom range: `/fieldtrack/dashboard/stats/?view_type=custom&from_date=2025-08-01&to_date=2025-08-19`

**Success Response (200):**

```json
{
  "user_id": 1,
  "user_name": "John Doe",
  "view_type": "monthly",
  "date_range": {
    "from_date": "2025-08-01",
    "to_date": "2025-08-31"
  },
  "visit_summary": {
    "total_visits": 45,
    "farmer_visits": 28,
    "dealer_visits": 17,
    "unique_dealers_visited": 15,
    "unique_farmers_visited": 25
  },
  "company_stats": {
    "total_dealers_in_company": 50,
    "total_farmers_in_company": 120,
    "dealers_coverage_percentage": 30.0,
    "farmers_coverage_percentage": 20.83
  },
  "time_tracking": {
    "total_working_hours": 152.5,
    "total_working_days": 19,
    "average_hours_per_day": 8.03
  },
  "first_punch_in": {
    "date": "2025-08-01",
    "time": "09:00:00",
    "latitude": 18.123456,
    "longitude": 73.654321
  },
  "last_punch_out": {
    "date": "2025-08-31",
    "time": "18:30:00",
    "latitude": 18.123456,
    "longitude": 73.654321
  },
  "daily_breakdown": [
    {
      "date": "2025-08-01",
      "punch_in_time": "09:00:00",
      "punch_out_time": "18:30:00",
      "total_visits": 3,
      "farmer_visits": 2,
      "dealer_visits": 1,
      "working_hours": 9.5,
      "punched_in": true,
      "punched_out": true
    }
  ]
}
```

### 2. Today's Dashboard

**Endpoint:** `GET /fieldtrack/dashboard/today/`
**Authentication:** Required
**Description:** Quick today's dashboard view optimized for mobile app home screen.

**Success Response (200):**

```json
{
  "date": "2025-08-19",
  "user_name": "John Doe",
  "punch_status": {
    "punched_in": true,
    "punched_out": false,
    "punch_in_time": "09:00:00",
    "punch_out_time": null,
    "punch_id": 45
  },
  "visit_summary": {
    "total_visits": 3,
    "farmer_visits": 2,
    "dealer_visits": 1,
    "unique_dealers_visited": 1,
    "unique_farmers_visited": 2
  },
  "working_hours": 8.5,
  "recent_visits": [
    {
      "id": 123,
      "entity_type": "Farmer",
      "entity_name": "Ram Patil",
      "visit_start_time": "2025-08-19T14:30:00",
      "visit_end_time": "2025-08-19T15:00:00",
      "duration_minutes": 30,
      "status": "completed"
    },
    {
      "id": 124,
      "entity_type": "Dealer",
      "entity_name": "ABC Agro Store",
      "visit_start_time": "2025-08-19T16:00:00",
      "visit_end_time": null,
      "duration_minutes": null,
      "status": "ongoing"
    }
  ]
}
```

### 3. Visit History

**Endpoint:** `GET /fieldtrack/dashboard/visit-history/`
**Authentication:** Required
**Description:** User's visit history with advanced filtering and pagination.

**Query Parameters:**

- `view_type` (optional): View type - `daily`, `monthly`, or `custom` (default: `daily`)
- `from_date` (required for custom): Start date in YYYY-MM-DD format
- `to_date` (required for custom): End date in YYYY-MM-DD format
- `type` (optional): Filter by visit type - `farmer`, `dealer`, or leave empty for all
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20, max: 100)

**Examples:**

- Today's visits: `/fieldtrack/dashboard/visit-history/?view_type=daily`
- This month's farmer visits: `/fieldtrack/dashboard/visit-history/?view_type=monthly&type=farmer`
- Custom date range dealer visits: `/fieldtrack/dashboard/visit-history/?view_type=custom&from_date=2025-08-01&to_date=2025-08-19&type=dealer&page=2`

**Success Response (200):**

```json
{
  "view_type": "monthly",
  "date_range": {
    "from_date": "2025-08-01",
    "to_date": "2025-08-31"
  },
  "filter_type": "farmer",
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 28,
    "total_pages": 2
  },
  "visits": [
    {
      "id": 123,
      "date": "2025-08-19",
      "entity_type": "Farmer",
      "entity_id": 45,
      "entity_name": "Ram Patil",
      "visit_start_time": "2025-08-19T14:30:00",
      "visit_end_time": "2025-08-19T15:00:00",
      "duration_minutes": 30,
      "status": "completed",
      "remark": "Discussed crop protection methods",
      "distance_from_last_km": 2.5
    },
    {
      "id": 122,
      "date": "2025-08-18",
      "entity_type": "Farmer",
      "entity_id": 47,
      "entity_name": "Shyam Kumar",
      "visit_start_time": "2025-08-18T11:15:00",
      "visit_end_time": "2025-08-18T12:00:00",
      "duration_minutes": 45,
      "status": "completed",
      "remark": "Demonstrated new fertilizer application",
      "distance_from_last_km": 5.2
    }
  ]
}
```

**Error Response (400 Bad Request):**

```json
{
  "detail": "from_date cannot be after to_date."
}
```

```json
{
  "detail": "Invalid date format. Use YYYY-MM-DD."
}
```

## Dashboard API Usage Guide

### View Types:

1. **Daily View (`view_type=daily`)**:

   - Shows today's data only
   - No date parameters required
   - Perfect for mobile home screen
2. **Monthly View (`view_type=monthly`)**:

   - Shows current month's data (1st to last day of month)
   - No date parameters required
   - Great for monthly performance review
3. **Custom View (`view_type=custom`)**:

   - Requires `from_date` and `to_date` parameters
   - Flexible date range selection
   - Perfect for custom reporting

### Key Metrics Explained:

- **Total Visits**: Count of all visit records
- **Farmer/Dealer Visits**: Visits filtered by entity type
- **Unique Visits**: Count of distinct farmers/dealers visited (prevents double counting)
- **Coverage Percentage**: (Unique visited / Total in company) × 100
- **Working Hours**: Calculated from punch in/out times
- **Average Hours**: Total working hours ÷ Working days

### Mobile App Integration Tips:

1. **Home Screen**: Use `/dashboard/today/` for quick overview
2. **Statistics Page**: Use `/dashboard/stats/` with appropriate view_type
3. **History Page**: Use `/dashboard/visit-history/` with pagination
4. **Calendar Integration**: Use custom view_type for date picker functionality
5. **Performance Cards**: Extract data from company_stats for coverage metrics

### Real-time Updates:

- APIs reflect real-time data from punch and visit records
- Refresh dashboard after punch in/out operations
- Refresh visit lists after completing visits

## File Uploads

- **Supported formats:** JPG, PNG, PDF
- **Maximum file size:** 10MB
- **Upload path:** Include files as multipart/form-data

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Response includes:

```json
{
  "count": 100,
  "next": "http://example.com/api/endpoint/?page=3",
  "previous": "http://example.com/api/endpoint/?page=1",
  "results": []
}
```

---

## Order Management APIs (`/order/`)

### Overview

The Order Management system provides comprehensive APIs for managing orders, order items, payments, and generating reports. All endpoints require authentication and are company-scoped for multi-tenant isolation.

### 1. List/Create Orders

**Endpoint:** `GET/POST /order/orders/`
**Authentication:** Required (Bearer Token)

**GET Request Parameters:**

- `status` (optional): Filter by order status (draft, submitted, approved, dispatched, cancelled, completed)
- `order_type` (optional): Filter by order type (scheme, regular, netrat, cash)
- `dealer_id` (optional): Filter by dealer ID
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**POST Request Body:**

```json
{
  "dealer_id": 15,
  "order_type": "regular",
  "due_date": "2025-09-25",
  "status": "draft"
}
```

**Success Response (200/201):**

```json
[
  {
    "id": 1,
    "company": {
      "id": 1,
      "name": "Company Name"
    },
    "dealer": {
      "id": 15,
      "shop_name": "ABC Electronics",
      "owner_name": "John Doe"
    },
    "order_type": "regular",
    "added_by": {
      "id": 3,
      "user": {
        "username": "manager1"
      }
    },
    "order_date": "2025-08-25",
    "due_date": "2025-09-25",
    "status": "draft",
    "total_amount": "0.00",
    "total_tax": "0.00",
    "created_at": "2025-08-25T10:30:00Z"
  }
]
```

### 2. Get Order Details

**Endpoint:** `GET /order/orders/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order ID

**Success Response (200):**

```json
{
  "id": 1,
  "company": {
    "id": 1,
    "name": "Company Name"
  },
  "dealer": {
    "id": 15,
    "shop_name": "ABC Electronics",
    "owner_name": "John Doe"
  },
  "order_type": "regular",
  "added_by": {
    "id": 3,
    "user": {
      "username": "manager1"
    }
  },
  "order_date": "2025-08-25",
  "due_date": "2025-09-25",
  "status": "draft",
  "total_amount": "1500.00",
  "total_tax": "270.00",
  "created_at": "2025-08-25T10:30:00Z",
  "items": [
    {
      "id": 1,
      "packing_id": 5,
      "packing_details": {
        "id": 5,
        "product": {
          "id": 2,
          "name": "Fertilizer A"
        },
        "packing_size": "50kg",
        "price": "500.00"
      },
      "quantity": 3,
      "rate": "500.00",
      "gst_rate": "18.00",
      "amount": "1500.00"
    }
  ],
  "payments": [
    {
      "id": 1,
      "payment_date": "2025-08-25",
      "amount": "500.00",
      "remarks": "Advance payment"
    }
  ]
}
```

### 3. Update Order

**Endpoint:** `PUT /order/orders/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order ID

**Request Body:**

```json
{
  "dealer_id": 15,
  "order_type": "regular",
  "due_date": "2025-09-30",
  "status": "submitted"
}
```

### 4. Partial Update Order

**Endpoint:** `PATCH /order/orders/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order ID

**Request Body:**

```json
{
  "status": "approved"
}
```

### 5. Delete Order

**Endpoint:** `DELETE /order/orders/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order ID

**Success Response (200):**

```json
{
  "message": "Order deleted successfully."
}
```

### 6. Update Order Status

**Endpoint:** `PATCH /order/orders/{id}/status/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order ID

**Request Body:**

```json
{
  "status": "dispatched"
}
```

### 7. List/Create Order Items

**Endpoint:** `GET/POST /order/order-items/`
**Authentication:** Required (Bearer Token)

**GET Query Parameters:**

- `order_id` (optional): Filter by order ID

**POST Request Body:**

```json
{
  "order": 1,
  "packing_id": 5,
  "quantity": 3,
  "rate": "500.00",
  "gst_rate": "18.00"
}
```

**Success Response (200/201):**

```json
[
  {
    "id": 1,
    "order": 1,
    "packing_id": 5,
    "packing_details": {
      "id": 5,
      "product": {
        "id": 2,
        "name": "Fertilizer A"
      },
      "packing_size": "50kg",
      "price": "500.00"
    },
    "quantity": 3,
    "rate": "500.00",
    "gst_rate": "18.00",
    "amount": "1500.00"
  }
]
```

### 8. Get Order Item Details

**Endpoint:** `GET /order/order-items/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order Item ID

### 9. Update Order Item

**Endpoint:** `PUT /order/order-items/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order Item ID

**Request Body:**

```json
{
  "order": 1,
  "packing_id": 5,
  "quantity": 5,
  "rate": "500.00",
  "gst_rate": "18.00"
}
```

### 10. Delete Order Item

**Endpoint:** `DELETE /order/order-items/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Order Item ID

**Success Response (200):**

```json
{
  "message": "Order item deleted successfully."
}
```

### 11. List/Create Payments

**Endpoint:** `GET/POST /order/payments/`
**Authentication:** Required (Bearer Token)

**GET Query Parameters:**

- `order_id` (optional): Filter by order ID
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**POST Request Body:**

```json
{
  "order": 1,
  "amount": "500.00",
  "remarks": "Advance payment"
}
```

**Success Response (200/201):**

```json
[
  {
    "id": 1,
    "company": {
      "id": 1,
      "name": "Company Name"
    },
    "order": 1,
    "added_by": {
      "id": 3,
      "user": {
        "username": "manager1"
      }
    },
    "payment_date": "2025-08-25",
    "amount": "500.00",
    "remarks": "Advance payment"
  }
]
```

### 12. Get Payment Details

**Endpoint:** `GET /order/payments/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Payment ID

### 13. Update Payment

**Endpoint:** `PUT /order/payments/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Payment ID

**Request Body:**

```json
{
  "order": 1,
  "amount": "750.00",
  "remarks": "Updated payment amount"
}
```

### 14. Delete Payment

**Endpoint:** `DELETE /order/payments/{id}/`
**Authentication:** Required (Bearer Token)

**Path Parameters:**

- `id` (required): Payment ID

**Success Response (200):**

```json
{
  "message": "Payment deleted successfully."
}
```

### 15. Order Summary

**Endpoint:** `GET /order/summary/`
**Authentication:** Required (Bearer Token)

**Query Parameters:**

- `status` (optional): Filter by order status
- `order_type` (optional): Filter by order type
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**Success Response (200):**

```json
[
  {
    "id": 1,
    "dealer_name": "ABC Electronics",
    "order_type": "regular",
    "order_date": "2025-08-25",
    "due_date": "2025-09-25",
    "status": "draft",
    "total_amount": "1500.00",
    "total_tax": "270.00",
    "items_count": 1,
    "payments_count": 1,
    "total_paid": "500.00",
    "balance_amount": "1000.00"
  }
]
```

### 16. Order Dashboard

**Endpoint:** `GET /order/dashboard/`
**Authentication:** Required (Bearer Token)

**Success Response (200):**

```json
{
  "today_orders_count": 5,
  "today_orders_amount": "7500.00",
  "month_orders_count": 45,
  "month_orders_amount": "67500.00",
  "pending_orders_count": 12,
  "completed_orders_count": 28,
  "total_orders_count": 150,
  "total_orders_amount": "225000.00"
}
```

### Order Status Flow

1. **draft** → **submitted** → **approved** → **dispatched** → **completed**
2. **cancelled** (can be set at any stage)

### Order Types

- **scheme**: Special promotional orders
- **regular**: Standard orders
- **netrat**: Net rate orders
- **cash**: Cash payment orders

### Automatic Calculations

- **Order Item Amount**: `quantity × rate`
- **Order Total Amount**: Sum of all item amounts
- **Order Total Tax**: Sum of (item_amount × gst_rate / 100)
- **Payment Balance**: `total_amount - total_paid`

### Error Responses

**400 Bad Request - Validation Error:**

```json
{
  "dealer_id": ["This field is required."],
  "due_date": ["This field is required."]
}
```

**404 Not Found:**

```json
{
  "detail": "Not found."
}
```

**400 Bad Request - Business Logic Error:**

```json
{
  "error": "Cannot update order status from 'completed' to 'draft'"
}
```

---

## Contact Information

For API support and questions, contact the development team.

---

_Last updated: August 25, 2025_
