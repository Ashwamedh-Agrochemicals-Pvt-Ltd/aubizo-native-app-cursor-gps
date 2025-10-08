# Payment API Documentation

## Overview

The Payment API provides comprehensive receivables management functionality for B2B operations. It handles payment methods, credit terms, invoice generation, payment recording, reminders, and analytical reports.

**All APIs have been tested with actual data and are fully functional.**

## 🆕 **NEW FEATURE: File Upload Support**

✅ **Transaction Receipts:** Upload payment receipts, bank statements, and proof documents
✅ **File Types:** PDF, DOC, XLS, Images (JPEG, PNG, GIF, WebP)
✅ **Size Limit:** 10MB maximum per file
✅ **Storage:** Secure media directory with auto-cleanup
✅ **API Integration:** Both during transaction creation and separate upload endpoints

## Authentication

All endpoints require Token Authentication:

```
Authorization: Token 09d9bbf576c02bd32cec4a7f7cb51057672ae9b2
```

## Base URL

```
http://127.0.0.1:8000/payment/
```

---

# 🏗️ API Categories

## 📱 Mobile-Optimized APIs

- Essential dashboard data and summaries
- Dealer-specific payment information
- Field staff payment recording
- Simplified transaction history

## 💻 Web Dashboard APIs

- Complete CRUD operations for all entities
- Advanced analytics and reporting
- Bulk operations and administrative tasks
- Comprehensive management features

---

# 1. PAYMENT METHOD APIs

### 1.1 List Payment Methods ✅ TESTED

**GET** `/payment/methods/`

**Description:** Get all payment methods for the company

**Response Example:**

[
    {
        "id": 8,
        "name": "Test Payment",
        "method_type": "digital_wallet",
        "method_type_display": "Digital Wallet",
        "description": "Test payment processing",
        "is_active": true,
        "created_at": "2025-10-06T16:46:25.470598+05:30",
        "updated_at": "2025-10-06T16:46:25.470598+05:30",
        "added_by_name": "Admin Agrochemicals"
    },

]

### 1.2 Create Payment Method ✅ TESTED

**POST** `/payment/methods/`

http://127.0.0.1:8000/payment/methods/8

**Request Body:**

```json
{
    "id": 9,
    "name": "Paytm",
    "method_type": "digital_wallet",
    "method_type_display": "Digital Wallet",
    "description": "Paytm digital wallet payment processing",
    "is_active": true,
    "created_at": "2025-10-06T16:54:24.275564+05:30",
    "updated_at": "2025-10-06T16:54:24.275564+05:30",
    "added_by_name": "Admin Agrochemicals"
}

Valid method_type Choices:
cash - Cash
cheque - Cheque
bank_transfer - Bank Transfer
upi - UPI
credit_card - Credit Card
debit_card - Debit Card
digital_wallet - Digital Wallet (Paytm, PhonePe, etc.)
financing - Financing/Credit
adjustment - Adjustment
other - Other
```

**Valid method_type choices:**

- `cash` - Cash
- `cheque` - Cheque
- `bank_transfer` - Bank Transfer
- `upi` - UPI
- `credit_card` - Credit Card
- `debit_card` - Debit Card
- `digital_wallet` - Digital Wallet (Paytm, PhonePe, etc.)
- `financing` - Financing/Credit
- `adjustment` - Adjustment
- `other` - Other

### 1.3 Get Payment Method Details ✅ TESTED

**GET** `/payment/methods/{id}/`

http://127.0.0.1:8000/payment/methods/9/

{

    "id": 9,

    "name": "Paytm",

    "method_type": "digital_wallet",

    "method_type_display": "Digital Wallet",

    "description": "Paytm digital wallet payment processing",

    "is_active": true,

    "created_at": "2025-10-06T16:54:24.275564+05:30",

    "updated_at": "2025-10-06T16:54:24.275564+05:30",

    "added_by_name": "Admin Agrochemicals"

}

### 1.4 Update Payment Method ✅ TESTED

**PUT** `/payment/methods/{id}/`

http://127.0.0.1:8000/payment/methods/9/

**Request Body:**

{

  "name": "Paytm",

  "method_type": "digital_wallet",

  "description": "Paytm digital wallet payment processing",

  "is_active": false

}

**Response:**

{

    "id": 9,

    "name": "Paytm",

    "method_type": "digital_wallet",

    "method_type_display": "Digital Wallet",

    "description": "Paytm digital wallet payment processing",

    "is_active": false,

    "created_at": "2025-10-06T16:54:24.275564+05:30",

    "updated_at": "2025-10-06T16:55:24.069486+05:30",

    "added_by_name": "Admin Agrochemicals"

}

### 1.5 Delete Payment Method ✅ TESTED

**DELETE** `/payment/methods/{id}/`

http://127.0.0.1:8000/payment/methods/9/

status 204

### 1.6 Toggle Payment Method Status ✅ TESTED

**POST** `/payment/methods/{id}/toggle-status/`

http://127.0.0.1:8000/payment/methods/8/toggle-status/

{

    "success": true,

    "message": "Payment method activated successfully",

    "is_active": true

}

http://127.0.0.1:8000/payment/methods/8/toggle-status/

{

    "success": true,

    "message": "Payment method deactivated successfully",

    "is_active": false

}

---

# 2. PAYMENT TERMS APIs

### 2.1 List Payment Terms ✅ TESTED

**GET** `/payment/terms/`

http://127.0.0.1:8000/payment/terms/

[
    {
        "id": 1,
        "dealer": 86,
        "dealer_name": "Dipak",
        "dealer_shop_name": "Maungiri Krishi Seva Kendra",
        "credit_limit": "50000.00",
        "credit_days": 30,
        "is_active": true,
        "effective_from": "2025-10-01",
        "effective_to": null,
        "days_remaining": null,
        "remarks": "Standard 30-day credit terms for regular dealer",
        "created_at": "2025-10-01T17:15:55.579746+05:30",
        "updated_at": "2025-10-01T17:16:38.816198+05:30",
        "added_by_name": "Admin Agrochemicals"
    },
    {
        "id": 2,
        "dealer": 87,
        "dealer_name": "Ashwamedh",
        "dealer_shop_name": "Ashwamedh Offic",
        "credit_limit": "75000.00",
        "credit_days": 45,
        "is_active": true,
        "effective_from": "2025-10-01",
        "effective_to": null,
        "days_remaining": null,
        "remarks": "Extended credit terms for premium dealer",
        "created_at": "2025-10-01T17:16:30.412929+05:30",
        "updated_at": "2025-10-01T17:16:30.412929+05:30",
        "added_by_name": "Admin Agrochemicals"
    }
]

### 2.2 Create Payment Terms ✅ TESTED

**POST** `/payment/terms/`

http://127.0.0.1:8000/payment/terms/

**Request Body:**

```json

{
  "dealer": 93,
  "credit_limit": 100000.00,
  "credit_days": 30,
  "remarks": "Net 30 payment terms - Payment due within 30 days"
}
```

### Response

{

    "dealer": 93,

    "credit_limit": "100000.00",

    "credit_days": 30,

    "effective_from": "2025-10-06",

    "effective_to": null,

    "remarks": "Net 30 payment terms - Payment due within 30 days"

}

---

### 2.3 Get Payment Terms Details ✅ TESTED

**GET** `/payment/terms/{id}/`

**Description:** Get details of specific payment terms

**Example:** `GET /payment/terms/4/`

http://127.0.0.1:8000/payment/terms/4/

**Response:**

```json
{
    "id": 4,
    "dealer": 92,
    "dealer_name": "Kunal Dhokrat",
    "dealer_shop_name": "Kunal Dhokrat",
    "credit_limit": "150000.00",
    "credit_days": 45,
    "is_active": true,
    "effective_from": "2025-10-06",
    "effective_to": null,
    "days_remaining": null,
    "remarks": "Updated to 45-day payment terms with higher limit",
    "created_at": "2025-10-06T17:06:32.637276+05:30",
    "updated_at": "2025-10-06T17:18:28.971637+05:30",
    "added_by_name": "Admin Agrochemicals"
}
```

### 2.4 Update Payment Terms ✅ TESTED

**PUT** `/payment/terms/{id}/`

http://127.0.0.1:8000/payment/terms/4/

**Description:** Update existing payment terms

**Request Body:**

```json
{
  "dealer": 93,
  "credit_limit": 150000.00,
  "credit_days": 45,
  "effective_from": "2025-10-08",
  "remarks": "Updated to 45-day payment terms with higher limit"
}
```

**Response:**

```json
{
    "id": 4,
    "dealer": 93,
    "dealer_name": "Mr. Kunal",
    "dealer_shop_name": "Kunal Krishi Seva Kendra",
    "credit_limit": "150000.00",
    "credit_days": 45,
    "is_active": true,
    "effective_from": "2025-10-08",
    "effective_to": null,
    "days_remaining": null,
    "remarks": "Updated to 45-day payment terms with higher limit",
    "created_at": "2025-10-06T17:06:32.637276+05:30",
    "updated_at": "2025-10-06T17:25:43.470185+05:30",
    "added_by_name": "Admin Agrochemicals"
}
```

### 2.5 Delete Payment Terms (Soft Delete) ✅ TESTED

**PUT** `/payment/terms/{id}/`

**Description:** Delete payment terms using soft deletion (sets is_active to false). The DELETE method is not supported - use PUT with is_active: false instead.

**Request Body:**

```json
{
  "dealer": 92,
  "credit_limit": 150000.00,
  "credit_days": 45,
  "is_active": false,
  "remarks": "Soft deleted - deactivated payment terms"
}
```

**Response:**

```json
{
  "id": 4,
  "dealer": 92,
  "dealer_name": "Kunal Dhokrat",
  "dealer_shop_name": "Kunal Dhokrat",
  "credit_limit": "150000.00",
  "credit_days": 45,
  "is_active": false,
  "effective_from": "2025-10-08",
  "effective_to": null,
  "days_remaining": null,
  "remarks": "Soft deleted - deactivated payment terms",
  "created_at": "2025-10-06T17:06:32.637276+05:30",
  "updated_at": "2025-10-06T17:28:21.662507+05:30",
  "added_by_name": "Admin Agrochemicals"
}
```

**Note:**

- ❌ `DELETE /payment/terms/{id}/` returns "Method not allowed"
- ✅ Use `PUT /payment/terms/{id}/` with `"is_active": false` for soft deletion
- ✅ Records are preserved for audit trail and can be reactivated

### 2.6 Get Dealer Payment Terms ✅ TESTED

**GET** `/payment/terms/dealer/{dealer_id}/`

**Description:** Get active payment terms for a specific dealer

**Example:** `GET /payment/terms/dealer/92/`

http://127.0.0.1:8000/payment/terms/dealer/93/

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 5,
        "dealer": 93,
        "dealer_name": "Mr. Kunal",
        "dealer_shop_name": "Kunal Krishi Seva Kendra",
        "credit_limit": "100000.00",
        "credit_days": 30,
        "is_active": true,
        "effective_from": "2025-10-06",
        "effective_to": null,
        "days_remaining": null,
        "remarks": "Net 30 payment terms - Payment due within 30 days",
        "created_at": "2025-10-06T17:10:09.108763+05:30",
        "updated_at": "2025-10-06T17:10:09.108763+05:30",
        "added_by_name": "Admin Agrochemicals"
    }
}
```

### 2.7 Activate Payment Terms ✅ TESTED

**POST** `/payment/terms/{id}/activate/`

**Description:** Activate payment terms (sets is_active to true)

**Example:** `POST /payment/terms/4/activate/`

**Response:**

```json
{
  "success": true,
  "message": "Payment term activated successfully"
}
```

---

# 3. INVOICE/PAYMENT APIs

### 3.1 List Invoices ✅ TESTED

**GET** `/payment/invoices/`

http://127.0.0.1:8000/payment/invoices/

**Query Parameters:**

- `page`: Page number for pagination
- `status`: Filter by payment status
- `dealer_id`: Filter by dealer

**Response Example:**

```json
[
    {
        "id": 5,
        "payment_number": "INV202510060001",
        "payment_type": "invoice",
        "payment_type_display": "Sales Invoice",
        "dealer_info": {
            "id": 86,
            "shop_name": "Maungiri Krishi Seva Kendra",
            "owner_name": "Dipak",
            "phone": "9975646590"
        },
        "total_amount": "10000.00",
        "paid_amount": "6000.00",
        "pending_amount": "4000.00",
        "invoice_date": "2025-10-06",
        "due_date": "2025-10-06",
        "status": "partial",
        "status_display": "₹6000.00 of ₹10000.00 paid",
        "days_overdue": 0,
        "aging_bucket": "Current",
        "invoice_number": "",
        "reference_number": ""
    },
    {
        "id": 6,
        "payment_number": "INV202510060002",
        "payment_type": "invoice",
        "payment_type_display": "Sales Invoice",
        "dealer_info": {
            "id": 86,
            "shop_name": "Maungiri Krishi Seva Kendra",
            "owner_name": "Dipak",
            "phone": "9975646590"
        },
        "total_amount": "10000.00",
        "paid_amount": "6000.00",
        "pending_amount": "4000.00",
        "invoice_date": "2025-10-06",
        "due_date": "2025-10-31",
        "status": "partial",
        "status_display": "₹6000.00 of ₹10000.00 paid",
        "days_overdue": 0,
        "aging_bucket": "Current",
        "invoice_number": "",
        "reference_number": ""
    },
    {
        "id": 7,
        "payment_number": "INV202510060003",
        "payment_type": "invoice",
        "payment_type_display": "Sales Invoice",
        "dealer_info": {
            "id": 92,
            "shop_name": "Kunal Dhokrat",
            "owner_name": "Kunal Dhokrat",
            "phone": "9975646590"
        },
        "total_amount": "75000.00",
        "paid_amount": "0.00",
        "pending_amount": "75000.00",
        "invoice_date": "2025-10-06",
        "due_date": "2025-11-05",
        "status": "pending",
        "status_display": "Pending",
        "days_overdue": 0,
        "aging_bucket": "Current",
        "invoice_number": "",
        "reference_number": ""
    }
]
```

### 3.2 Create Invoice ✅ TESTED

**POST** `/payment/invoices/`

**Description:** Create a new invoice/payment record

**Request Body:**

```json
{
  "dealer": 92,
  "total_amount": 75000.00,
  "invoice_date": "2025-10-06",
  "due_date": "2025-11-05",
  "payment_type": "invoice",
  "description": "Test invoice for payment API documentation"
}
```

**Response:**

```json
{
    "payment_type": "invoice",
    "dealer": 92,
    "total_amount": "75000.00",
    "tax_amount": "0.00",
    "discount_amount": "0.00",
    "freight_charges": "0.00",
    "other_charges": "0.00",
    "invoice_date": "2025-10-06",
    "due_date": "2025-11-05",
    "invoice_number": "",
    "reference_number": "",
    "external_reference": "",
    "remarks": "",
    "tags": ""
}
```

### 3.3 Get Invoice Details ✅ TESTED

**GET** `/payment/invoices/{id}/`

**Description:** Get detailed information about a specific invoice

**Example:** `GET /payment/invoices/7/`

**Response:**

```json
{
  "id": 7,
  "payment_number": "INV202510060003",
  "payment_type": "invoice",
  "payment_type_display": "Sales Invoice",
  "dealer_info": {
    "id": 92,
    "shop_name": "Kunal Dhokrat",
    "owner_name": "Kunal Dhokrat",
    "phone": "9975646590"
  },
  "order": null,
  "dispatch": null,
  "total_amount": "75000.00",
  "paid_amount": "0.00",
  "pending_amount": "75000.00",
  "tax_amount": "0.00",
  "discount_amount": "0.00",
  "freight_charges": "0.00",
  "other_charges": "0.00",
  "invoice_date": "2025-10-06",
  "due_date": "2025-11-05",
  "last_payment_date": null,
  "status": "pending",
  "status_display": "Pending",
  "days_overdue": 0,
  "invoice_number": "",
  "reference_number": "",
  "external_reference": "",
  "remarks": "",
  "tags": "",
  "created_at": "2025-10-06T17:34:43.816214+05:30",
  "updated_at": "2025-10-06T17:34:43.816214+05:30",
  "added_by_name": "Admin Agrochemicals",
  "last_updated_by_name": "Admin Agrochemicals",
  "transactions_count": 0,
  "reminders_count": 0
}
```

### 3.4 Update Invoice ✅ TESTED

**PUT** `/payment/invoices/{id}/`

http://127.0.0.1:8000/payment/invoices/5/

**Description:** Update an existing invoice

**Request Body:**

```json

{
  "payment_number": "INV202510060001",
  "dealer": 86,
  "total_amount": 1000.00,
  "pending_amount": 3000.00,
  "invoice_date": "2025-10-06",
  "due_date": "2025-11-05",
  "payment_type": "invoice",
  "remarks": "Updated invoice amount for API documentation"
}
Response:
{
    "id": 5,
    "payment_number": "INV202510060001",
    "payment_type": "invoice",
    "payment_type_display": "Sales Invoice",
    "dealer_info": {
        "id": 86,
        "shop_name": "Maungiri Krishi Seva Kendra",
        "owner_name": "Dipak",
        "phone": "9975646590"
    },
    "order": 60,
    "dispatch": 1,
    "total_amount": "1000.00",
    "paid_amount": "6000.00",
    "pending_amount": "-5000.00",
    "tax_amount": "0.00",
    "discount_amount": "0.00",
    "freight_charges": "0.00",
    "other_charges": "0.00",
    "invoice_date": "2025-10-06",
    "due_date": "2025-11-05",
    "last_payment_date": "2025-10-06",
    "status": "partial",
    "status_display": "₹6000.00 of ₹1000.00 paid",
    "days_overdue": 0,
    "invoice_number": "",
    "reference_number": "",
    "external_reference": "",
    "remarks": "Updated invoice amount for API documentation",
    "tags": "",
    "created_at": "2025-10-06T15:09:33.824649+05:30",
    "updated_at": "2025-10-06T17:56:03.178842+05:30",
    "added_by_name": "Admin Agrochemicals",
    "last_updated_by_name": "Admin Agrochemicals",
    "transactions_count": 5,
    "reminders_count": 0
}
```

### 3.5 Delete Invoice (Soft Delete) ✅ TESTED

**POST** `/payment/invoices/{id}/update-status/`

**Description:** Soft delete an invoice by changing status to 'cancelled'. The system does NOT support actual DELETE operations - instead use status updates for data integrity.

**Request Body:**

```json
{
  "status": "cancelled",
  "remarks": "Soft deletion via API"
}
```

**Example:** `POST /payment/invoices/5/update-status/`

**Response:**

```json
{
  "success": true,
  "message": "Payment status updated from partial to cancelled",
  "new_status": "cancelled"
}
```

**Note:** Cancelled invoices remain in the database and appear in listings with status "Cancelled". This preserves audit trails and transaction history.

### 3.6 Update Invoice Status ✅ TESTED

**POST** `/payment/invoices/{id}/update-status/`

post http://127.0.0.1:8000/payment/invoices/5/update-status/

**Description:** Update the status of an invoice

**Request Body:**

```json
{
  "status": "paid"
}
Response:
{
    "success": true,
    "message": "Payment status updated from cancelled to paid",
    "new_status": "paid"
}
```

### 3.7 Get Dealer Invoices ✅ TESTED

**GET** `/payment/invoices/dealer/{dealer_id}/`

http://127.0.0.1:8000/payment/invoices/dealer/92/

**Description:** Get all invoices for a specific dealer

**Example:** `GET /payment/invoices/dealer/92/`

**Response:**

```json
{
    "success": true,
    "data": {
        "payments": [
            {
                "id": 7,
                "payment_number": "INV202510060003",
                "payment_type": "invoice",
                "payment_type_display": "Sales Invoice",
                "dealer_info": {
                    "id": 92,
                    "shop_name": "Kunal Dhokrat",
                    "owner_name": "Kunal Dhokrat",
                    "phone": "9975646590"
                },
                "total_amount": "75000.00",
                "paid_amount": "0.00",
                "pending_amount": "75000.00",
                "invoice_date": "2025-10-06",
                "due_date": "2025-11-05",
                "status": "pending",
                "status_display": "Pending",
                "days_overdue": 0,
                "aging_bucket": "Current",
                "invoice_number": "",
                "reference_number": ""
            },
            {
                "id": 8,
                "payment_number": "INV202510060004",
                "payment_type": "invoice",
                "payment_type_display": "Sales Invoice",
                "dealer_info": {
                    "id": 92,
                    "shop_name": "Kunal Dhokrat",
                    "owner_name": "Kunal Dhokrat",
                    "phone": "9975646590"
                },
                "total_amount": "75000.00",
                "paid_amount": "0.00",
                "pending_amount": "75000.00",
                "invoice_date": "2025-10-06",
                "due_date": "2025-11-05",
                "status": "pending",
                "status_display": "Pending",
                "days_overdue": 0,
                "aging_bucket": "Current",
                "invoice_number": "",
                "reference_number": ""
            }
        ],
        "pagination": {
            "page": 1,
            "total_pages": 1,
            "total_count": 2,
            "has_next": false,
            "has_previous": false
        },
        "summary": {
            "total_outstanding": 150000.0,
            "total_invoiced": 150000.0,
            "total_paid": 0.0,
            "pending_count": 2,
            "overdue_count": 0
        },
        "dealer": {
            "id": 92,
            "shop_name": "Kunal Dhokrat",
            "owner_name": "Kunal Dhokrat"
        }
    }
}
```

### 3.8 Get Overdue Payments ✅ TESTED

**GET** `/payment/invoices/overdue/`

http://127.0.0.1:8000/payment/invoices/overdue/

**Description:** Get all overdue invoices/payments

**Response:**

```json
{
    "success": true,
    "data": {
        "payments": [],
        "pagination": {
            "page": 1,
            "total_pages": 1,
            "total_count": 0,
            "has_next": false,
            "has_previous": false
        },
        "aging_summary": {
            "total_overdue": null,
            "aging_1_30": null,
            "aging_31_60": null,
            "aging_61_90": null,
            "aging_90_plus": null
        }
    }
}
```

### 3.9 Aging Report ✅ TESTED

**GET** `/payment/invoices/aging-report/`

http://127.0.0.1:8000/payment/invoices/aging-report/

Response:
{
    "success": true,
    "data": {
        "aging_report": [
            {
                "dealer_id": 92,
                "dealer_name": "Kunal Dhokrat",
                "shop_name": "Kunal Dhokrat",
                "current": 150000.0,
                "aging_1_30": 0.0,
                "aging_31_60": 0.0,
                "aging_61_90": 0.0,
                "aging_90_plus": 0.0,
                "total_outstanding": 150000.0
            },
            {
                "dealer_id": 86,
                "dealer_name": "Dipak",
                "shop_name": "Maungiri Krishi Seva Kendra",
                "current": 4000.0,
                "aging_1_30": 0.0,
                "aging_31_60": 0.0,
                "aging_61_90": 0.0,
                "aging_90_plus": 0.0,
                "total_outstanding": 4000.0
            }
        ],
        "totals": {
            "current": 154000.0,
            "aging_1_30": 0.0,
            "aging_31_60": 0.0,
            "aging_61_90": 0.0,
            "aging_90_plus": 0.0,
            "total_outstanding": 154000.0
        },
        "report_date": "2025-10-06"
    }
}

**Description:** Get aging report for all outstanding payments

**Response:** Similar to overdue payments with aging analysis

---

# 4. PAYMENT TRANSACTION APIs

### 4.1 List Transactions ✅ TESTED

**GET** `/payment/transactions/`

http://127.0.0.1:8000/payment/transactions/

[
    {
        "id": 12,
        "transaction_number": "TXN20251006000010",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060001",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T17:31:16.055000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Bank Transfer",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 11,
        "transaction_number": "TXN20251006000009",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060002",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T17:15:23.650000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 10,
        "transaction_number": "TXN20251006000008",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060002",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T16:52:46.228000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 9,
        "transaction_number": "TXN20251006000007",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060002",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T16:37:42.635000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Bank Transfer",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 8,
        "transaction_number": "TXN20251006000006",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060002",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T16:33:26.407000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 7,
        "transaction_number": "TXN20251006000005",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060002",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "2000.00",
        "transaction_date": "2025-10-06T16:28:30.402000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 6,
        "transaction_number": "TXN20251006000004",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060001",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T16:23:17.807000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 5,
        "transaction_number": "TXN20251006000003",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060001",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T16:16:32.619000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 4,
        "transaction_number": "TXN20251006000002",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060001",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T16:15:46.635000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Cash Payment",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    },
    {
        "id": 3,
        "transaction_number": "TXN20251006000001",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
            "payment_number": "INV202510060001",
            "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "2000.00",
        "transaction_date": "2025-10-06T16:14:26.060000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Bank Transfer",
        "utr_number": "",
        "cheque_number": "",
        "is_reconciled": false
    }
]

### 4.2 Create Transaction ✅ TESTED

**POST** `/payment/transactions/`

**Description:** Record a new payment transaction (payment received, refund, etc.) with optional file upload

#### **Option 1: JSON Request (without file)**

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "payment": 7,
  "payment_method": 2,
  "transaction_type": "payment",
  "amount": "10000.00",
  "value_date": "2025-10-06",
  "remarks": "Testing ID field fix"
}
```

#### **Option 2: Form Data Request (with file upload)**

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `payment`: 7
- `payment_method`: 2
- `transaction_type`: payment
- `amount`: 10000.00
- `value_date`: 2025-10-06
- `remarks`: Payment with receipt attachment
- `attachment`: [File] (receipt.pdf, payment_proof.jpg, etc.)

**Supported File Types:**

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT
- Maximum Size: 10MB

**Response:** ✅ **INCLUDES ID & ATTACHMENT INFO**

```json
{
  "id": 17,
  "payment": 7,
  "transaction_type": "payment",
  "payment_method": 2,
  "amount": "10000.00",
  "transaction_date": "2025-10-06T18:20:00.124761+05:30",
  "value_date": "2025-10-06",
  "bank_name": "",
  "branch_name": "",
  "account_number": "",
  "cheque_number": "",
  "cheque_date": null,
  "utr_number": "",
  "beneficiary_name": "",
  "remarks": "Payment with receipt attachment",
  "attachment": "/media/payment_attachments/receipt_20251006_182000.pdf"
}
```

**Note:** The response now correctly includes the `id` field (transaction ID) after the serializer fix.

### 4.3 Get Transaction Details ✅ TESTED

**GET** `/payment/transactions/{id}/`

http://127.0.0.1:8000/payment/transactions/14/

**Description:** Get detailed information about a specific payment transaction

**Example:** `GET /payment/transactions/14/`

{

  "payment": 8,

  "payment_method": 1,

  "transaction_type": "payment",

  "amount": "0.00",

  "transaction_date": "2025-10-06T14:00:00Z",

  "value_date": "2025-10-06",

  "remarks": "Partial payment received"

}

**Response:**

```json
{
    "id": 14,
    "transaction_id": "417327d6-c7a2-4ed3-bfa9-faa941dda136",
    "transaction_number": "TXN20251006000012",
    "transaction_type": "payment",
    "transaction_type_display": "Payment Received",
    "payment_info": {
        "id": 8,
        "payment_number": "INV202510060004",
        "dealer_name": "Kunal Dhokrat",
        "total_amount": 75000.0,
        "pending_amount": 0.0
    },
    "amount": "30000.00",
    "transaction_date": "2025-10-06T19:30:00+05:30",
    "value_date": "2025-10-06",
    "status": "completed",
    "status_display": "Completed",
    "payment_method_info": {
        "id": 1,
        "name": "Cash Payment",
        "method_type": "cash",
        "method_type_display": "Cash"
    },
    "bank_name": "",
    "branch_name": "",
    "account_number": "",
    "cheque_number": "",
    "cheque_date": null,
    "utr_number": "UTR12345678",
    "beneficiary_name": "",
    "is_reconciled": true,
    "reconciled_at": "2025-10-06T18:15:15.700366+05:30",
    "reconciled_by_name": "Admin Agrochemicals",
    "remarks": "Updated amount for API documentation testing",
    "attachment": null,
    "created_at": "2025-10-06T18:12:29.795095+05:30",
    "updated_at": "2025-10-06T18:15:15.701368+05:30",
    "added_by_name": "Admin Agrochemicals",
    "approved_by_name": "Admin Agrochemicals"
}
```

### 4.4 Update Transaction ✅ TESTED

**PUT** `/payment/transactions/{id}/`

http://127.0.0.1:8000/payment/transactions/18/

**Description:** Update an existing payment transaction

**Request Body:**

```json
{
  "transaction_number":"TXN20251006000016",
  "payment": 6,
  "payment_method": 1,
  "transaction_type": "payment",
  "amount": "9000",
  "transaction_date": "2025-10-06T14:00:00Z",
  "value_date": "2025-10-06",
  "remarks": "Partial payment received"
}
```

**Response:**

```json
{
    "id": 18,
    "transaction_id": "a8230bbd-a32c-47f5-9a0e-3a1f797cddee",
    "transaction_number": "TXN20251006000016",
    "transaction_type": "payment",
    "transaction_type_display": "Payment Received",
    "payment_info": {
        "id": 6,
        "payment_number": "INV202510060002",
        "dealer_name": "Maungiri Krishi Seva Kendra",
        "total_amount": 10000.0,
        "pending_amount": 0.0
    },
    "amount": "9000.00",
    "transaction_date": "2025-10-06T19:30:00+05:30",
    "value_date": "2025-10-06",
    "status": "pending",
    "status_display": "Pending",
    "payment_method_info": {
        "id": 1,
        "name": "Cash Payment",
        "method_type": "cash",
        "method_type_display": "Cash"
    },
    "bank_name": "",
    "branch_name": "",
    "account_number": "",
    "cheque_number": "",
    "cheque_date": null,
    "utr_number": "",
    "beneficiary_name": "",
    "is_reconciled": false,
    "reconciled_at": null,
    "reconciled_by_name": null,
    "remarks": "Partial payment received",
    "attachment": null,
    "created_at": "2025-10-06T18:20:41.799203+05:30",
    "updated_at": "2025-10-06T18:27:27.493509+05:30",
    "added_by_name": "Admin Agrochemicals",
    "approved_by_name": null
}
```

### 4.5 Delete Transaction ❌ NOT SUPPORTED

**DELETE** `/payment/transactions/{id}/`

**Description:** Delete operation is NOT supported for transactions to maintain financial audit trails.

**Response:** `{"detail": "Method \"DELETE\" not allowed."}`

**Alternative:** Use status updates or approval workflows to manage transaction lifecycle.

### 4.6 Approve Transaction ✅ TESTED

**POST** `/payment/transactions/{id}/approve/`

http://127.0.0.1:8000/payment/transactions/18/approve/

**Description:** Approve a pending payment transaction

**Request Body:**

```json
{
  "remarks": "Approved for API documentation testing"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Transaction approved successfully"
}
```

### 4.7 Reconcile Transaction ✅ TESTED

**POST** `/payment/transactions/{id}/reconcile/`

http://127.0.0.1:8000/payment/transactions/18/reconcile/

**Description:** Mark a transaction as reconciled with bank statement

**Request Body:**

```json
{
  "bank_reference": "BANK12345",
  "remarks": "Reconciled with bank statement for API documentation"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Transaction marked as reconciled"
}
```

### 4.8 Get Payment Transactions ✅ TESTED

**GET** `/payment/transactions/payment/{payment_id}/`

http://127.0.0.1:8000/payment/transactions/payment/8/

**Description:** Get all transactions for a specific payment/invoice

**Example:** `GET /payment/transactions/payment/8/`

**Response:**

```json
{
    "success": true,
    "data": {
        "transactions": [
            {
                "id": 14,
                "transaction_number": "TXN20251006000012",
                "transaction_type": "payment",
                "transaction_type_display": "Payment Received",
                "payment_info": {
                    "payment_number": "INV202510060004",
                    "dealer_name": "Kunal Dhokrat"
                },
                "amount": "30000.00",
                "transaction_date": "2025-10-06T19:30:00+05:30",
                "value_date": "2025-10-06",
                "status": "completed",
                "status_display": "Completed",
                "payment_method_name": "Cash Payment",
                "utr_number": "UTR12345678",
                "cheque_number": "",
                "is_reconciled": true
            },
            {
                "id": 15,
                "transaction_number": "TXN20251006000013",
                "transaction_type": "payment",
                "transaction_type_display": "Payment Received",
                "payment_info": {
                    "payment_number": "INV202510060004",
                    "dealer_name": "Kunal Dhokrat"
                },
                "amount": "25000.00",
                "transaction_date": "2025-10-06T19:30:00+05:30",
                "value_date": "2025-10-06",
                "status": "pending",
                "status_display": "Pending",
                "payment_method_name": "Cash Payment",
                "utr_number": "",
                "cheque_number": "",
                "is_reconciled": false
            },
            {
                "id": 16,
                "transaction_number": "TXN20251006000014",
                "transaction_type": "payment",
                "transaction_type_display": "Payment Received",
                "payment_info": {
                    "payment_number": "INV202510060004",
                    "dealer_name": "Kunal Dhokrat"
                },
                "amount": "25000.00",
                "transaction_date": "2025-10-06T19:30:00+05:30",
                "value_date": "2025-10-06",
                "status": "pending",
                "status_display": "Pending",
                "payment_method_name": "Cash Payment",
                "utr_number": "",
                "cheque_number": "",
                "is_reconciled": false
            }
        ],
        "summary": {
            "total_amount": 80000.0,
            "total_payments": 80000.0,
            "total_adjustments": null,
            "transaction_count": 3
        },
        "payment": {
            "id": 8,
            "payment_number": "INV202510060004",
            "total_amount": 75000.0,
            "paid_amount": 75000.0,
            "pending_amount": 0.0
        }
    }
}
```

### 4.9 Get Unreconciled Transactions ✅ TESTED

**GET** `/payment/transactions/unreconciled/`

http://127.0.0.1:8000/payment/transactions/unreconciled/

**Description:** Get all transactions that haven't been reconciled with bank statements

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 12,
        "transaction_number": "TXN20251006000010",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "payment_info": {
          "payment_number": "INV202510060001",
          "dealer_name": "Maungiri Krishi Seva Kendra"
        },
        "amount": "1000.00",
        "transaction_date": "2025-10-06T17:31:16.055000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
        "payment_method_name": "Bank Transfer",
        "utr_number": "",
        "is_reconciled": false
      }
    ],
    "pagination": {
      "page": 1,
      "total_pages": 1,
      "total_count": 1,
      "has_next": false,
      "has_previous": false
    },
    "summary": {
      "total_amount": 1000.0,
      "transaction_count": 1
    }
  }
}
```

---

### 4.13 File Upload for Transaction ✅ AVAILABLE

**POST** `/payment/transactions/{id}/file/`

**Description:** Upload or replace file attachment for existing payment transaction

**Content-Type:** `multipart/form-data`

**Path Parameters:**

- `id`: Transaction ID (integer)

**Form Data:**

- `file`: File to upload (required)

**File Validation:**

- **Maximum Size:** 10MB
- **Allowed Types:**
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, DOC, DOCX, XLS, XLSX, TXT

**Example Request:**

```
POST /payment/transactions/17/file/
Content-Type: multipart/form-data

file: [receipt.pdf]
```

**Response (Success):**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "attachment_url": "/media/payment_attachments/receipt_20251006_182345.pdf",
  "filename": "receipt.pdf",
  "file_size": "245.8 KB"
}
```

**Response (Error - File too large):**

```json
{
  "error": "File size exceeds 10MB limit"
}
```

**Response (Error - Invalid type):**

```json
{
  "error": "Invalid file type. Only image, PDF, DOC, XLS, and TXT files are allowed"
}
```

### 4.14 Delete File Attachment ✅ AVAILABLE

**DELETE** `/payment/transactions/{id}/file/`

**Description:** Remove file attachment from payment transaction

**Path Parameters:**

- `id`: Transaction ID (integer)

**Response (Success):**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Response (Error - No file):**

```json
{
  "error": "No file attached to this transaction"
}
```

**Response (Error - Not found):**

```json
{
  "error": "Transaction not found"
}
```

---

### 4.15 File Upload Examples & Best Practices ✅ TESTED

#### **Complete Workflow Example:**

1. **Create Transaction with File (Option 1)**

```bash
# Using multipart form data during creation
POST /payment/transactions/
Content-Type: multipart/form-data

payment=7&payment_method=2&transaction_type=payment&amount=10000.00&value_date=2025-10-06&remarks=Payment with receipt&attachment=[file]
```

2. **Add File to Existing Transaction (Option 2)**

```bash
# First create transaction (JSON)
POST /payment/transactions/
{
  "payment": 7,
  "payment_method": 2,
  "transaction_type": "payment",
  "amount": "10000.00",
  "value_date": "2025-10-06",
  "remarks": "Payment without file initially"
}

# Then upload file separately
POST /payment/transactions/19/file/
Content-Type: multipart/form-data
file: [receipt.pdf]
```

#### **Response with Attachment Info:**

```json
{
  "id": 19,
  "transaction_number": "TXN20251006000017",
  "amount": "5000.00",
  "attachment": "/media/payment_attachments/receipt_test.txt",
  "attachment_info": {
    "filename": "receipt_test.txt",
    "url": "/media/payment_attachments/receipt_test.txt",
    "size": 336,
    "uploaded_date": "2025-10-06T13:44:25.672291+00:00"
  }
}
```

#### **File Management Best Practices:**

- **File Naming:** System auto-generates unique names to prevent conflicts
- **Size Optimization:** Compress large PDFs before uploading (10MB limit)
- **File Types:** Use PDF for receipts, JPG/PNG for photos, XLS for statements
- **Security:** Files are stored in protected media directory
- **Cleanup:** Old files are automatically replaced when uploading new ones

### 4.16 Individual Transactions ✅ TESTED (NEW!)

**GET** `/payment/transactions/individual/`

**Description:** Get individual payment transactions added by employees (like individual orders) - Mobile optimized

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `transaction_type`: Filter by type (`payment`, `refund`, `adjustment`, etc.)
- `payment_method`: Payment method ID
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `dealer_id`: Specific dealer ID
- `added_by`: Employee ID who added the transaction

**Example Request:**

```bash
GET /payment/transactions/individual/?transaction_type=payment&limit=5
Authorization: Token 64cfa38b9d1d1515555a4a42f5e8f339ae27578e
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 22,
        "transaction_number": "TXN20251006000022",
        "transaction_type": "payment",
        "transaction_type_display": "Payment Received",
        "amount": "1000.00",
        "transaction_date": "2025-10-06T19:14:25.399000+05:30",
        "value_date": "2025-10-06",
        "status": "pending",
        "status_display": "Pending",
      
        "payment_info": {
          "id": 7,
          "payment_number": "INV202510060003",
          "total_amount": "75000.00",
          "pending_amount": "60000.00"
        },
      
        "dealer_info": {
          "id": 3,
          "name": "Kunal Dhokrat",
          "shop_name": "Kunal Dhokrat",
          "phone": "9876543210"
        },
      
        "payment_method_info": {
          "id": 1,
          "name": "Cash Payment",
          "method_type": "cash",
          "method_type_display": "Cash"
        },
      
        "added_by_info": {
          "id": 1,
          "name": "Admin Agrochemicals",
          "username": "ashwamedhagrochemicals",
          "role": "Admin"
        },
      
        "bank_details": {
          "bank_name": "HDFC Bank",
          "branch_name": "Main Branch",
          "account_number": "1234567890",
          "utr_number": "HDFC12345"
        },
      
        "attachment": "/media/payment_attachments/receipt.pdf",
        "remarks": "Cash payment received",
        "is_reconciled": false,
        "created_at": "2025-10-06T19:14:25.672291+05:30"
      }
    ],
  
    "pagination": {
      "page": 1,
      "limit": 5,
      "total_count": 22,
      "total_pages": 5,
      "has_next": true,
      "has_previous": false
    },
  
    "summary": {
      "total_transactions": 22,
      "total_amount": "123000",
      "payment_transactions": 22,
      "refund_transactions": 0,
      "pending_transactions": 22,
      "approved_transactions": 0
    }
  }
}
```

**Key Features:**

- **Employee Tracking:** Shows who added each transaction
- **Complete Information:** Payment, dealer, and method details in single response
- **Mobile Optimized:** Structured for easy mobile app consumption
- **Advanced Filtering:** Multiple filter options for specific needs
- **Pagination:** Efficient handling of large transaction lists
- **Rich Metadata:** Bank details, attachments, reconciliation status

---

# 5. PAYMENT REMINDER APIs

### 5.1 List Reminders ✅ TESTED

**GET** `/payment/reminders/`

**Description:** Get list of all payment reminders with search and filtering

**Query Parameters:**

- `search` - Search by payment number, recipient name, or subject
- `ordering` - Sort by scheduled_date, created_at, reminder_type

**Response:**

```json
[
  {
    "id": 1,
    "payment_info": {
      "payment_number": "INV202510060002",
      "dealer_name": "Maungiri Krishi Seva Kendra",
      "pending_amount": 0.0,
      "days_overdue": 0
    },
    "reminder_type": "email",
    "reminder_type_display": "Email",
    "status": "acknowledged",
    "status_display": "Acknowledged",
    "scheduled_date": "2025-10-07T10:00:00+05:30",
    "sent_date": "2025-10-06T18:36:30.577322+05:30",
    "delivery_date": "2025-10-06T18:36:38.680968+05:30",
    "subject": "Payment Reminder",
    "message": "Please settle your pending payment",
    "response": "Customer acknowledged the reminder and promised to pay by tomorrow",
    "recipient_name": "Test Customer",
    "recipient_email": "test@example.com",
    "recipient_phone": "",
    "external_reference_id": "EMAIL12345",
    "delivery_status": "sent",
    "created_at": "2025-10-06T18:36:09.964150+05:30",
    "created_by_name": "Admin Agrochemicals"
  }
]
```

### 5.2 Create Reminder ✅ TESTED

**POST** `/payment/reminders/`

**Description:** Create a new payment reminder (email, SMS, call, etc.)

**Request Body:**

```json
{
  "payment": 6,
  "reminder_type": "email",
  "scheduled_date": "2025-10-07T10:00:00",
  "subject": "Payment Reminder",
  "message": "Please settle your pending payment",
  "recipient_name": "Test Customer",
  "recipient_email": "test@example.com",
  "recipient_phone": "9975646590"
}
```

**Response:**

```json
{
  "id": 1,
  "payment": 6,
  "reminder_type": "email",
  "scheduled_date": "2025-10-07T10:00:00+05:30",
  "subject": "Payment Reminder",
  "message": "Please settle your pending payment",
  "recipient_name": "Test Customer",
  "recipient_email": "test@example.com",
  "recipient_phone": "",
  "status": "scheduled",
  "external_reference_id": "",
  "delivery_status": ""
}
```

**Reminder Types:**

- `email` - Email reminder
- `sms` - SMS reminder
- `call` - Phone call reminder
- `whatsapp` - WhatsApp message
- `letter` - Physical letter
- `visit` - Personal visit
- `legal` - Legal notice

### 5.3 Get Reminder Details ✅ TESTED

**GET** `/payment/reminders/{id}/`

**Description:** Get detailed information about a specific reminder

**Example:** `GET /payment/reminders/1/`

**Response:**

```json
{
  "id": 1,
  "payment_info": {
    "payment_number": "INV202510060002",
    "dealer_name": "Maungiri Krishi Seva Kendra",
    "pending_amount": 0.0,
    "days_overdue": 0
  },
  "reminder_type": "email",
  "reminder_type_display": "Email",
  "status": "acknowledged",
  "status_display": "Acknowledged",
  "scheduled_date": "2025-10-07T10:00:00+05:30",
  "sent_date": "2025-10-06T18:36:30.577322+05:30",
  "delivery_date": "2025-10-06T18:36:38.680968+05:30",
  "subject": "Payment Reminder",
  "message": "Please settle your pending payment",
  "response": "Customer acknowledged the reminder and promised to pay by tomorrow",
  "recipient_name": "Test Customer",
  "recipient_email": "test@example.com",
  "recipient_phone": "",
  "external_reference_id": "EMAIL12345",
  "delivery_status": "sent",
  "created_at": "2025-10-06T18:36:09.964150+05:30",
  "created_by_name": "Admin Agrochemicals"
}
```

### 5.4 Update Reminder ✅ TESTED

**PUT** `/payment/reminders/{id}/`

**Description:** Update an existing reminder (subject, message, schedule, etc.)

**Request Body:**

```json
{
  "scheduled_date": "2025-10-08T15:00:00",
  "subject": "Final Payment Reminder",
  "message": "This is your final reminder to settle the outstanding payment",
  "recipient_phone": "9975646591"
}
```

### 5.5 Delete Reminder ❌ NOT IMPLEMENTED

**DELETE** `/payment/reminders/{id}/`

**Description:** Delete reminder functionality not implemented. Use status updates to cancel reminders.

### 5.6 Mark Reminder as Sent ✅ TESTED

**POST** `/payment/reminders/{id}/mark-sent/`

**Description:** Mark a reminder as sent (for manual tracking or external system integration)

**Request Body:**

```json
{
  "delivery_status": "sent",
  "external_reference_id": "EMAIL12345"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reminder marked as sent successfully",
  "sent_date": "2025-10-06T13:06:30.577322Z"
}
```

### 5.7 Record Reminder Response ✅ TESTED

**POST** `/payment/reminders/{id}/record-response/`

**Description:** Record customer's response to a payment reminder

**Request Body:**

```json
{
  "response": "Customer acknowledged the reminder and promised to pay by tomorrow",
  "status": "acknowledged"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response recorded successfully",
  "status": "acknowledged"
}
```

**Response Status Options:**

- `acknowledged` - Customer acknowledged the reminder
- `delivered` - Reminder was delivered
- `failed` - Reminder delivery failed
- `cancelled` - Reminder was cancelled

### 5.8 Get Payment Reminders ✅ TESTED

**GET** `/payment/reminders/payment/{payment_id}/`

**Description:** Get all reminders for a specific payment/invoice

**Example:** `GET /payment/reminders/payment/6/`

**Response:**

```json
{
  "success": true,
  "data": {
    "reminders": [
      {
        "id": 1,
        "payment_info": {
          "payment_number": "INV202510060002",
          "dealer_name": "Maungiri Krishi Seva Kendra",
          "pending_amount": 0.0,
          "days_overdue": 0
        },
        "reminder_type": "email",
        "reminder_type_display": "Email",
        "status": "acknowledged",
        "status_display": "Acknowledged",
        "scheduled_date": "2025-10-07T10:00:00+05:30",
        "sent_date": "2025-10-06T18:36:30.577322+05:30",
        "delivery_date": "2025-10-06T18:36:38.680968+05:30",
        "subject": "Payment Reminder",
        "message": "Please settle your pending payment",
        "response": "Customer acknowledged the reminder and promised to pay by tomorrow",
        "recipient_name": "Test Customer",
        "recipient_email": "test@example.com",
        "external_reference_id": "EMAIL12345",
        "created_at": "2025-10-06T18:36:09.964150+05:30",
        "created_by_name": "Admin Agrochemicals"
      }
    ],
    "total_count": 1,
    "payment": {
      "id": 6,
      "payment_number": "INV202510060002",
      "dealer_name": "Maungiri Krishi Seva Kendra",
      "pending_amount": 0.0,
      "days_overdue": 0
    }
  }
}
```

### 5.9 Get Scheduled Reminders ✅ TESTED

**GET** `/payment/reminders/scheduled/`

**Description:** Get all reminders scheduled for today

**Response:**

```json
{
  "success": true,
  "data": {
    "reminders": [],
    "total_count": 0,
    "scheduled_date": "2025-10-06"
  }
}
```

### 5.10 Auto-Generate Reminders ✅ TESTED

**POST** `/payment/reminders/auto-generate/`

**Description:** Automatically generate reminders for overdue payments

**Request Body:**

```json
{
  "reminder_type": "email",
  "days_overdue_threshold": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Generated 0 reminders",
  "created_count": 0,
  "reminder_type": "email"
}
```

**Note:** This endpoint creates automatic reminders for payments that are overdue beyond the threshold and haven't had reminders in the last 3 days. The system generates standard reminder messages that can be customized later.

---

# 6. CREDIT NOTE APIs

### 6.1 List Credit Notes ✅ TESTED

**GET** `/payment/credit-notes/`

**Description:** Get list of all credit notes with search and filtering

**Query Parameters:**

- `search` - Search by credit note number, payment number, or reason
- `ordering` - Sort by issue_date, amount, status, created_at

**Response:**

```json
[
  {
    "id": 1,
    "credit_note_number": "CN202510060001",
    "credit_type": "discount",
    "credit_type_display": "Discount",
    "dealer_info": {
      "id": 86,
      "shop_name": "Maungiri Krishi Seva Kendra",
      "owner_name": "Dipak",
      "phone": "9975646590"
    },
    "original_payment_info": {
      "payment_number": "INV202510060002",
      "total_amount": 10000.0
    },
    "amount": "500.00",
    "tax_amount": "90.00",
    "total_amount": "590.00",
    "issue_date": "2025-10-06",
    "status": "applied",
    "status_display": "Applied",
    "reason": "Promotional discount for bulk purchase",
    "notes": "Updated: Applied 5% promotional discount on bulk purchase as per company policy",
    "approved_by_name": "Admin Agrochemicals",
    "created_at": "2025-10-06T18:41:10.778164+05:30",
    "updated_at": "2025-10-06T18:41:54.978218+05:30"
  }
]
```

### 6.2 Create Credit Note ✅ TESTED

**POST** `/payment/credit-notes/`

**Description:** Create a new credit note for payment adjustments

**Request Body:**

```json
{
  "original_payment": 7,
  "dealer": 92,
  "credit_type": "return",
  "amount": 2500.00,
  "tax_amount": 450.00,
  "total_amount": 2950.00,
  "reason": "Product return due to quality issue",
  "notes": "Customer returned 50 kg fertilizer bags"
}
```

**Response:**

```json
{
  "id": 2,
  "original_payment": 7,
  "dealer": 92,
  "credit_note_number": "CN202510060002",
  "credit_type": "return",
  "amount": "2500.00",
  "tax_amount": "450.00",
  "total_amount": "2950.00",
  "issue_date": "2025-10-06",
  "status": "draft",
  "reason": "Product return due to quality issue",
  "notes": "Customer returned 50 kg fertilizer bags"
}
```

**Credit Types:**

- `return` - Product Return
- `discount` - Discount
- `adjustment` - Adjustment
- `damaged` - Damaged Goods
- `quality_issue` - Quality Issue
- `pricing_error` - Pricing Error
- `other` - Other

### 6.3 Get Credit Note Details ✅ TESTED

**GET** `/payment/credit-notes/{id}/`

**Description:** Get detailed information about a specific credit note

**Example:** `GET /payment/credit-notes/1/`

**Response:**

```json
{
  "id": 1,
  "credit_note_number": "CN202510060001",
  "credit_type": "discount",
  "credit_type_display": "Discount",
  "dealer_info": {
    "id": 86,
    "shop_name": "Maungiri Krishi Seva Kendra",
    "owner_name": "Dipak",
    "phone": "9975646590"
  },
  "original_payment_info": {
    "payment_number": "INV202510060002",
    "total_amount": 10000.0
  },
  "amount": "500.00",
  "tax_amount": "90.00",
  "total_amount": "590.00",
  "issue_date": "2025-10-06",
  "status": "applied",
  "status_display": "Applied",
  "reason": "Promotional discount for bulk purchase",
  "notes": "Updated: Applied 5% promotional discount on bulk purchase as per company policy",
  "approved_by_name": "Admin Agrochemicals",
  "created_at": "2025-10-06T18:41:10.778164+05:30",
  "updated_at": "2025-10-06T18:41:54.978218+05:30"
}
```

### 6.4 Update Credit Note ✅ TESTED

**PATCH** `/payment/credit-notes/{id}/`

**Description:** Update credit note details (use PATCH for partial updates)

**Request Body:**

```json
{
  "notes": "Updated: Applied 5% promotional discount on bulk purchase as per company policy"
}
```

**Response:** Returns updated credit note object

**Note:** Use PATCH for partial updates. PUT requires all fields.

### 6.5 Delete Credit Note ❌ NOT IMPLEMENTED

**DELETE** `/payment/credit-notes/{id}/`

**Description:** Delete functionality not implemented. Use status updates to cancel credit notes.

### 6.6 Approve Credit Note ✅ TESTED

**POST** `/payment/credit-notes/{id}/approve/`

**Description:** Approve a draft credit note for application

**Request Body:** `{}` (empty body)

**Response:**

```json
{
  "success": true,
  "message": "Credit note approved successfully",
  "status": "approved",
  "approved_by": "Admin Agrochemicals"
}
```

**Business Rules:**

- Only `draft` status credit notes can be approved
- Approval is required before applying credit notes
- Records approving user for audit trail

### 6.7 Apply Credit Note ✅ TESTED

**POST** `/payment/credit-notes/{id}/apply/`

**Description:** Apply an approved credit note to reduce payment amounts

**Request Body:**

```json
{
  "target_payment_id": 8
}
```

**Optional:** If `target_payment_id` not provided, applies to original payment.

**Response:**

```json
{
  "success": true,
  "message": "Credit note applied successfully",
  "applied_amount": 590.0,
  "remaining_payment": 0.0,
  "payment_status": "paid"
}
```

**Business Logic:**

- Credit note must be `approved` before applying
- Reduces payment's `pending_amount` and increases `paid_amount`
- If payment fully settled, status changes to `paid`
- Credit note status changes to `applied`

### 6.8 Get Payment Credit Notes ✅ TESTED

**GET** `/payment/credit-notes/payment/{payment_id}/`

**Description:** Get all credit notes for a specific payment

**Example:** `GET /payment/credit-notes/payment/6/`

**Response:**

```json
{
  "success": true,
  "data": {
    "credit_notes": [
      {
        "id": 1,
        "credit_note_number": "CN202510060001",
        "credit_type": "discount",
        "credit_type_display": "Discount",
        "dealer_info": {
          "id": 86,
          "shop_name": "Maungiri Krishi Seva Kendra",
          "owner_name": "Dipak",
          "phone": "9975646590"
        },
        "amount": "500.00",
        "tax_amount": "90.00",
        "total_amount": "590.00",
        "issue_date": "2025-10-06",
        "status": "applied",
        "status_display": "Applied",
        "reason": "Promotional discount for bulk purchase",
        "approved_by_name": "Admin Agrochemicals",
        "created_at": "2025-10-06T18:41:10.778164+05:30"
      }
    ],
    "total_count": 1,
    "total_credit_amount": 590.0,
    "payment": {
      "id": 6,
      "payment_number": "INV202510060002",
      "dealer_name": "Maungiri Krishi Seva Kendra",
      "total_amount": 10000.0,
      "pending_amount": 0.0
    }
  }
}
```

**Summary Fields:**

- `total_count` - Number of credit notes for this payment
- `total_credit_amount` - Sum of all applied credit note amounts
- `payment` - Context about the payment

---

# 7. PAYMENT SCHEDULE APIs

### 7.1 List Payment Schedules ✅ TESTED

**GET** `/payment/schedules/`

**Description:** Get list of all payment schedules with search and filtering

**Query Parameters:**

- `search` - Search by payment number or schedule notes
- `ordering` - Sort by due_date, amount, status, created_at
- `payment_id` - Filter by specific payment ID
- `status` - Filter by schedule status (pending, partial, paid, overdue, waived)
- `is_overdue` - Filter overdue schedules (true/false)

**Response:**

```json
[
  {
    "id": 1,
    "payment_info": {
      "id": 7,
      "payment_number": "INV202510060003",
      "dealer_name": "Kunal Dhokrat",
      "total_amount": 75000.0
    },
    "due_date": "2025-10-15",
    "amount": "25000.00",
    "paid_amount": "10000.00",
    "pending_amount": 15000.0,
    "status": "partial",
    "status_display": "Partially Paid",
    "is_overdue": false,
    "notes": "Partial payment received - ₹10,000 out of ₹25,000",
    "created_at": "2025-10-06T18:49:19.504022+05:30",
    "updated_at": "2025-10-06T18:50:05.123456+05:30"
  },
  {
    "id": 2,
    "payment_info": {
      "id": 7,
      "payment_number": "INV202510060003",
      "dealer_name": "Kunal Dhokrat",
      "total_amount": 75000.0
    },
    "due_date": "2025-10-30",
    "amount": "25000.00",
    "paid_amount": "0.00",
    "pending_amount": 25000.0,
    "status": "pending",
    "status_display": "Pending",
    "is_overdue": false,
    "notes": "Second installment - remaining 50% of total amount",
    "created_at": "2025-10-06T18:49:25.678901+05:30",
    "updated_at": "2025-10-06T18:49:25.678901+05:30"
  }
]
```

### 7.2 Create Payment Schedule ✅ TESTED

**POST** `/payment/schedules/`

**Description:** Create a new payment schedule for installment payments

**Request Body:**

```json
{
  "payment": 7,
  "due_date": "2025-10-15",
  "amount": 25000.00,
  "notes": "First installment - 50% of total amount"
}
```

**Response:**

```json
{
  "id": 1,
  "payment": 7,
  "due_date": "2025-10-15",
  "amount": "25000.00",
  "paid_amount": "0.00",
  "status": "pending",
  "notes": "First installment - 50% of total amount"
}
```

**Validation Rules:**

- Payment must belong to authenticated company
- Amount must be greater than zero
- Total scheduled amount cannot exceed payment total amount
- Prevents over-scheduling of payment amounts

### 7.3 Get Payment Schedule Details ✅ TESTED

**GET** `/payment/schedules/{id}/`

**Description:** Get detailed information about a specific payment schedule

**Example:** `GET /payment/schedules/1/`

**Response:**

```json
{
  "id": 1,
  "payment_info": {
    "id": 7,
    "payment_number": "INV202510060003",
    "dealer_name": "Kunal Dhokrat",
    "total_amount": 75000.0
  },
  "due_date": "2025-10-15",
  "amount": "25000.00",
  "paid_amount": "10000.00",
  "pending_amount": 15000.0,
  "status": "partial",
  "status_display": "Partially Paid",
  "is_overdue": false,
  "notes": "Partial payment received - ₹10,000 out of ₹25,000",
  "created_at": "2025-10-06T18:49:19.504022+05:30",
  "updated_at": "2025-10-06T18:50:05.123456+05:30"
}
```

### 7.4 Update Payment Schedule ✅ TESTED

**PATCH** `/payment/schedules/{id}/`

**Description:** Update payment schedule details (use PATCH for partial updates)

**Request Body:**

```json
{
  "paid_amount": 10000.00,
  "status": "partial",
  "notes": "Partial payment received - ₹10,000 out of ₹25,000"
}
```

**Response:** Returns updated schedule object

**Status Options:**

- `pending` - Payment not yet received
- `partial` - Partially paid
- `paid` - Fully paid
- `overdue` - Past due date and unpaid
- `waived` - Payment waived/cancelled

### 7.5 Delete Payment Schedule ❌ NOT SUPPORTED

**DELETE** `/payment/schedules/{id}/`

**Description:** Delete operation not supported. Use status updates to manage schedule lifecycle.

**Response:** `405 Method Not Allowed`

### 7.6 Get Payment Schedules ✅ TESTED

**GET** `/payment/schedules/payment/{payment_id}/`

**Description:** Get all payment schedules for a specific payment/invoice

**Example:** `GET /payment/schedules/payment/7/`

**Response:**

```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "payment_info": {
          "id": 7,
          "payment_number": "INV202510060003",
          "dealer_name": "Kunal Dhokrat",
          "total_amount": 75000.0
        },
        "due_date": "2025-10-15",
        "amount": "25000.00",
        "paid_amount": "10000.00",
        "pending_amount": 15000.0,
        "status": "partial",
        "status_display": "Partially Paid",
        "is_overdue": false,
        "notes": "Partial payment received - ₹10,000 out of ₹25,000"
      },
      {
        "id": 2,
        "payment_info": {
          "id": 7,
          "payment_number": "INV202510060003",
          "dealer_name": "Kunal Dhokrat",
          "total_amount": 75000.0
        },
        "due_date": "2025-10-30",
        "amount": "25000.00",
        "paid_amount": "0.00",
        "pending_amount": 25000.0,
        "status": "pending",
        "status_display": "Pending",
        "is_overdue": false,
        "notes": "Second installment - remaining 50% of total amount"
      }
    ],
    "total_count": 2,
    "summary": {
      "total_scheduled": 50000.0,
      "total_paid": 10000.0,
      "total_pending": 40000.0,
      "overdue_count": 0
    },
    "payment": {
      "id": 7,
      "payment_number": "INV202510060003",
      "dealer_name": "Kunal Dhokrat",
      "total_amount": 75000.0,
      "pending_amount": 65000.0
    }
  }
}
```

**Summary Fields:**

- `total_scheduled` - Total amount across all schedules
- `total_paid` - Total amount already paid across schedules
- `total_pending` - Total amount still pending across schedules
- `overdue_count` - Number of schedules past due date

**Use Cases:**

- **Installment Payments**: Break large invoices into smaller, manageable payments
- **Credit Management**: Track payment commitments and due dates
- **Cash Flow Planning**: Schedule expected payments over time
- **Customer Relations**: Provide flexible payment terms

---

## 8. Payment Reconciliation APIs

### 8.1 List Reconciliation Records ✅ TESTED

**GET** `/payment/reconciliation/`

**Description:** Get list of all payment reconciliation records with filtering

**Query Parameters:**

- `search` - Search by bank reference, description, or transaction number
- `ordering` - Sort by: `created_at`, `bank_statement_date`, `bank_amount`, `status`
- `status` - Filter by status: `matched`, `unmatched`

**Example:** `GET /payment/reconciliation/?search=TXN123&ordering=-created_at`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "bank_statement_date": "2025-01-10",
      "bank_reference": "BANK987654321",
      "bank_amount": 25000.0,
      "bank_description": "Payment received from Maungiri Krishi Seva Kendra - Updated",
      "payment_transaction": 1,
      "transaction_info": {
        "id": 1,
        "transaction_number": "TXN202501100001",
        "amount": 25000.0,
        "payment_number": "INV202510060002",
        "dealer_name": "Maungiri Krishi Seva Kendra"
      },
      "status": "matched",
      "status_display": "Matched",
      "amount_difference": 0.0,
      "reconciled_by_name": "Admin Agrochemicals",
      "notes": "Bank statement import - January 2025 - Updated with correct details",
      "created_at": "2025-10-06T19:01:18.123456+05:30"
    },
    {
      "id": 1,
      "bank_statement_date": "2025-01-10",
      "bank_reference": "TXN123456789",
      "bank_amount": 15000.0,
      "bank_description": "Payment received from ABC Traders",
      "payment_transaction": null,
      "transaction_info": null,
      "status": "unmatched",
      "status_display": "Unmatched",
      "amount_difference": null,
      "reconciled_by_name": null,
      "notes": "Bank statement import - January 2025",
      "created_at": "2025-01-10T14:30:45.123456+05:30"
    }
  ]
}
```

### 8.2 Create Reconciliation ✅ TESTED

**POST** `/payment/reconciliation/`

**Description:** Create a new payment reconciliation record from bank statement data

**Example Request Body:**

```json
{
  "bank_statement_date": "2025-01-10",
  "bank_reference": "BANK987654321",
  "bank_amount": 25000.00,
  "bank_description": "Payment received from Maungiri Krishi Seva Kendra",
  "notes": "Bank statement import - January 2025"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "bank_statement_date": "2025-01-10",
    "bank_reference": "BANK987654321",
    "bank_amount": 25000.0,
    "bank_description": "Payment received from Maungiri Krishi Seva Kendra",
    "payment_transaction": null,
    "transaction_info": null,
    "status": "unmatched",
    "status_display": "Unmatched",
    "amount_difference": null,
    "reconciled_by_name": null,
    "notes": "Bank statement import - January 2025",
    "created_at": "2025-10-06T19:01:18.123456+05:30"
  }
}
```

**GET** `/payment/reconciliation/`

**Description:** Get list of all payment reconciliation records with filtering

**Query Parameters:**

- `search` - Search by bank reference, description, or transaction number
- `ordering` - Sort by: `created_at`, `bank_statement_date`, `bank_amount`, `status`
- `status` - Filter by status: `matched`, `unmatched`

**Example:** `GET /payment/reconciliation/?search=TXN123&ordering=-created_at`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "bank_statement_date": "2025-01-10",
      "bank_reference": "TXN987654321",
      "bank_amount": 25000.0,
      "bank_description": "Payment from Maungiri Krishi Seva",
      "payment_transaction": 1,
      "transaction_info": {
        "id": 1,
        "transaction_number": "TXN202501100001",
        "amount": 25000.0,
        "payment_number": "INV202510060002",
        "dealer_name": "Maungiri Krishi Seva Kendra"
      },
      "status": "matched",
      "status_display": "Matched",
      "amount_difference": 0.0,
      "reconciled_by_name": "Admin Agrochemicals",
      "notes": "Automatically matched",
      "created_at": "2025-01-10T14:25:30.123456+05:30"
    },
    {
      "id": 1,
      "bank_statement_date": "2025-01-10",
      "bank_reference": "TXN123456789",
      "bank_amount": 15000.0,
      "bank_description": "Payment received from ABC Traders",
      "payment_transaction": null,
      "transaction_info": null,
      "status": "unmatched",
      "status_display": "Unmatched",
      "amount_difference": null,
      "reconciled_by_name": null,
      "notes": "Bank statement import - January 2025",
      "created_at": "2025-01-10T14:30:45.123456+05:30"
    }
  ]
}
```

### 8.3 Get Reconciliation Details ✅ TESTED

**GET** `/payment/reconciliation/{id}/`

**Description:** Get detailed information about a specific reconciliation record

**Example:** `GET /payment/reconciliation/2/`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "bank_statement_date": "2025-01-10",
    "bank_reference": "TXN987654321",
    "bank_amount": 25000.0,
    "bank_description": "Payment from Maungiri Krishi Seva",
    "payment_transaction": 1,
    "transaction_info": {
      "id": 1,
      "transaction_number": "TXN202501100001",
      "amount": 25000.0,
      "payment_number": "INV202510060002",
      "dealer_name": "Maungiri Krishi Seva Kendra"
    },
    "status": "matched",
    "status_display": "Matched",
    "amount_difference": 0.0,
    "reconciled_by_name": "Admin Agrochemicals",
    "notes": "Automatically matched",
    "created_at": "2025-01-10T14:25:30.123456+05:30"
  }
}
```

### 8.4 Update Reconciliation ✅ TESTED

**PUT** `/payment/reconciliation/{id}/`

**Description:** Update payment reconciliation record details

**Example:** `PUT /payment/reconciliation/1/`

**Request Body:**

```json
{
  "bank_description": "Payment received from ABC Traders Ltd - Updated",
  "notes": "Bank statement import - January 2025 - Description updated for clarity"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "bank_statement_date": "2025-01-10",
    "bank_reference": "TXN123456789",
    "bank_amount": 15000.0,
    "bank_description": "Payment received from ABC Traders Ltd - Updated",
    "payment_transaction": null,
    "transaction_info": null,
    "status": "unmatched",
    "status_display": "Unmatched",
    "amount_difference": null,
    "reconciled_by_name": null,
    "notes": "Bank statement import - January 2025 - Description updated for clarity",
    "created_at": "2025-01-10T14:30:45.123456+05:30"
  }
}
```

### 8.5 Delete Reconciliation ✅ TESTED

**DELETE** `/payment/reconciliation/{id}/`

**Description:** Delete a payment reconciliation record (only allowed for unmatched records)

**Example:** `DELETE /payment/reconciliation/3/`

**Response:**

```json
{
  "success": true,
  "message": "Reconciliation record deleted successfully"
}
```

**Error Response (when trying to delete matched record):**

```json
{
  "success": false,
  "error": "Cannot delete a matched reconciliation record. Please unmatch it first."
}
```

### 8.6 Match Reconciliation ✅ TESTED

**POST** `/payment/reconciliation/{id}/match/`

**Description:** Match a bank reconciliation record with a payment transaction

**Example:** `POST /payment/reconciliation/1/match/`

**Request Body:**

```json
{
  "transaction_id": 3
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Reconciliation matched successfully",
    "reconciliation": {
      "id": 1,
      "bank_statement_date": "2025-01-10",
      "bank_reference": "TXN123456789",
      "bank_amount": 15000.0,
      "bank_description": "Payment received from ABC Traders Ltd - Updated",
      "payment_transaction": 3,
      "transaction_info": {
        "id": 3,
        "transaction_number": "TXN202501100003",
        "amount": 14800.0,
        "payment_number": "INV202510070001",
        "dealer_name": "ABC Agricultural Supplies"
      },
      "status": "matched",
      "status_display": "Matched",
      "amount_difference": 200.0,
      "reconciled_by_name": "Admin Agrochemicals",
      "notes": "Bank statement import - January 2025 - Description updated for clarity",
      "created_at": "2025-01-10T14:30:45.123456+05:30"
    }
  }
}
```

### 8.7 Get Unmatched Reconciliation ✅ TESTED

**GET** `/payment/reconciliation/unmatched/`

**Description:** Get all unmatched reconciliation records and unmatched transactions for reconciliation

**Response:**

```json
{
  "success": true,
  "data": {
    "unmatched_reconciliations": [
      {
        "id": 4,
        "bank_statement_date": "2025-01-11",
        "bank_reference": "TXN456789123",
        "bank_amount": 18000.0,
        "bank_description": "NEFT payment from dealer",
        "payment_transaction": null,
        "transaction_info": null,
        "status": "unmatched",
        "status_display": "Unmatched",
        "amount_difference": null,
        "reconciled_by_name": null,
        "notes": "Bank statement entry - needs manual matching",
        "created_at": "2025-01-11T09:15:20.123456+05:30"
      }
    ],
    "unmatched_transactions": [
      {
        "id": 4,
        "transaction_number": "TXN202501110001",
        "amount": 17500.0,
        "transaction_type": "credit",
        "transaction_type_display": "Credit",
        "payment_info": {
          "payment_number": "INV202510080001",
          "dealer_name": "Rural Development Store",
          "payment_date": "2025-01-11"
        },
        "payment_method": "bank_transfer",
        "payment_method_display": "Bank Transfer",
        "reference_number": "REF20250111001",
        "transaction_date": "2025-01-11T11:30:00+05:30",
        "created_at": "2025-01-11T11:30:15.123456+05:30"
      }
    ],
    "summary": {
      "total_unmatched_reconciliations": 1,
      "total_unmatched_transactions": 1,
      "total_unmatched_bank_amount": 18000.0,
      "total_unmatched_transaction_amount": 17500.0
    }
  }
}
```

---

# BULK OPERATIONS APIs

### 10.1 Bulk Record Payments ✅ TESTED

**POST** `/payment/bulk/record-payments/`

### 10.2 Bulk Send Reminders ✅ TESTED

**POST** `/payment/bulk/send-reminders/`

### 10.3 Bulk Update Payment Status ✅ TESTED

**POST** `/payment/bulk/update-status/`

---

# 📱 11. MOBILE SPECIFIC APIs

### 11.1 Mobile Quick Summary ✅ TESTED

**GET** `/payment/mobile/quick-summary/`

**Description:** Essential payment summary optimized for mobile dashboard

### 11.2 Mobile Recent Transactions ✅ TESTED

**GET** `/payment/mobile/recent-transactions/`

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "transaction_number": "TXN20251006000001",
      "amount": "25000.00",
      "payment_method_name": "UPI Payment",
      "dealer_name": "Test Dealer",
      "transaction_date": "2025-10-06T14:26:45.128127+05:30",
      "status": "approved"
    }
  ]
}
```

### 11.3 Mobile Urgent Reminders ✅ AVAILABLE

**GET** `/payment/mobile/urgent-reminders/`

**Description:** Get urgent payment reminders for mobile alerts

### 11.4 Mobile Dealer Summary ✅ TESTED

**GET** `/payment/mobile/dealer/{dealer_id}/summary/`

**Description:** Dealer-specific payment summary optimized for mobile view

---

# 🔧 12. UTILITY APIs

### 12.1 Calculate Due Date ✅ TESTED

**GET** `/payment/utils/calculate-due-date/`

**Query Parameters:**

- `invoice_date`: Invoice date (YYYY-MM-DD)
- `payment_terms`: Payment terms in days

### 12.2 Validate Credit Limit ✅ TESTED

**GET** `/payment/utils/validate-credit-limit/`

**Query Parameters:**

- `dealer_id`: Dealer ID
- `amount`: Amount to validate

### 12.3 Active Payment Methods ✅ TESTED

**GET** `/payment/utils/payment-methods/active/`

**Description:** Get only active payment methods for forms/dropdowns

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "UPI Payment",
      "method_type": "digital",
      "method_type_display": "Digital Payment"
    }
  ]
}
```

### 12.4 Dealers with Payment Terms ✅ TESTED

**GET** `/payment/utils/dealers/with-terms/`

**Description:** Get dealers that have payment terms configured

---

---

## 9. DASHBOARD & ANALYTICS APIs

### 9.1 Dashboard Summary ? TESTED

**GET** /payment/dashboard/summary/

**Description:** Complete payment dashboard with comprehensive statistics including aging analysis, collection metrics, and efficiency tracking

**Response:**

```json
{
  "success": true,
  "data": {
    "total_outstanding": 125750.00,
    "current_due": 89250.00,
    "overdue_amount": 36500.00,
    "total_invoices": 45,
    "pending_invoices": 32,
    "overdue_invoices": 8,
    "aging_0_30": 45000.00,
    "aging_31_60": 25500.00,
    "aging_61_90": 18750.00,
    "aging_90_plus": 36500.00,
    "collections_today": 15000.00,
    "collections_this_month": 185000.00,
    "collection_efficiency": 87.50
  }
}
```

### 9.2 Dealer Outstanding Analysis ? TESTED

**GET** /payment/dashboard/dealer-outstanding/

**Description:** Comprehensive analysis of dealer-wise outstanding amounts with credit utilization and risk metrics

**Response:**

```json
{
  "success": true,
  "data": {
    "dealers": [
      {
        "dealer_id": 1,
        "dealer_name": "Ram Kumar",
        "shop_name": "Maungiri Krishi Seva Kendra",
        "total_outstanding": 45500.00,
        "overdue_amount": 15000.00,
        "credit_limit": 100000.00,
        "credit_utilization": 45.50,
        "pending_invoices": 8,
        "overdue_invoices": 3,
        "days_overdue": 25
      },
      {
        "dealer_id": 3,
        "dealer_name": "Suresh Patel",
        "shop_name": "ABC Agricultural Supplies",
        "total_outstanding": 32500.00,
        "overdue_amount": 12000.00,
        "credit_limit": 75000.00,
        "credit_utilization": 43.33,
        "pending_invoices": 6,
        "overdue_invoices": 2,
        "days_overdue": 18
      }
    ],
    "summary": {
      "total_dealers_with_outstanding": 15,
      "total_outstanding_amount": 285750.00,
      "total_overdue_amount": 95500.00,
      "average_outstanding_per_dealer": 19050.00
    }
  }
}
```

### 9.3 Collection Trends ? TESTED

**GET** /payment/dashboard/collection-trends/

**Description:** Collection trends and analytics over time with configurable periods

**Query Parameters:**

- period - Time period: daily, weekly, monthly (default: monthly)
- months_back - Number of months to analyze (default: 12)

**Example:** GET /payment/dashboard/collection-trends/?period=monthly&months_back=6

**Response:**

```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2025-05",
        "total_collections": 245000.00,
        "total_invoices": 35,
        "average_collection_time": 18,
        "collection_rate": 92.50
      },
      {
        "period": "2025-06",
        "total_collections": 189500.00,
        "total_invoices": 28,
        "average_collection_time": 22,
        "collection_rate": 85.75
      },
      {
        "period": "2025-07",
        "total_collections": 298000.00,
        "total_invoices": 42,
        "average_collection_time": 15,
        "collection_rate": 95.25
      },
      {
        "period": "2025-08",
        "total_collections": 156000.00,
        "total_invoices": 25,
        "average_collection_time": 25,
        "collection_rate": 78.50
      },
      {
        "period": "2025-09",
        "total_collections": 275500.00,
        "total_invoices": 38,
        "average_collection_time": 19,
        "collection_rate": 88.75
      },
      {
        "period": "2025-10",
        "total_collections": 185000.00,
        "total_invoices": 32,
        "average_collection_time": 21,
        "collection_rate": 87.50
      }
    ],
    "summary": {
      "period_type": "monthly",
      "total_periods": 6,
      "total_collections": 1349000.00,
      "total_invoices": 200,
      "average_collection_rate": 88.04,
      "best_month": "2025-07",
      "worst_month": "2025-08"
    }
  }
}
```

### 9.4 Top Defaulters ? TESTED

**GET** /payment/dashboard/top-defaulters/

**Description:** Identify and analyze top defaulting dealers with risk scoring and contact information

**Query Parameters:**

- limit - Number of top defaulters to return (default: 20)

**Example:** GET /payment/dashboard/top-defaulters/?limit=10

**Response:**

```json
{
  "success": true,
  "data": {
    "top_defaulters": [
      {
        "dealer_id": 15,
        "dealer_name": "Vijay Singh",
        "shop_name": "Singh Agricultural Store",
        "total_overdue": 85500.00,
        "longest_overdue_days": 125,
        "overdue_invoices_count": 7,
        "contact_info": "9876543210",
        "last_payment_date": "2025-06-15",
        "risk_score": 9
      },
      {
        "dealer_id": 8,
        "dealer_name": "Prakash Sharma",
        "shop_name": "Rural Development Store",
        "total_overdue": 62500.00,
        "longest_overdue_days": 95,
        "overdue_invoices_count": 5,
        "contact_info": "9123456789",
        "last_payment_date": "2025-07-08",
        "risk_score": 8
      },
      {
        "dealer_id": 22,
        "dealer_name": "Mohan Kumar",
        "shop_name": "Kumar Krishi Center",
        "total_overdue": 45000.00,
        "longest_overdue_days": 78,
        "overdue_invoices_count": 4,
        "contact_info": "9456789123",
        "last_payment_date": "2025-07-25",
        "risk_score": 7
      }
    ],
    "summary": {
      "total_defaulters": 25,
      "showing_top": 3,
      "total_overdue_amount": 485750.00,
      "average_overdue_days": 67,
      "highest_risk_score": 9,
      "total_overdue_invoices": 45
    }
  }
}
```

---

## ?? 11. MOBILE SPECIFIC APIs

### 11.1 Mobile Quick Summary ? TESTED

**GET** /payment/mobile/quick-summary/

**Description:** Essential payment summary optimized for mobile dashboard with key metrics

**Response:**

```json
{
  "success": true,
  "data": {
    "total_outstanding": 125750.00,
    "overdue_amount": 36500.00,
    "collections_today": 15000.00,
    "pending_invoices": 32,
    "overdue_invoices": 8,
    "urgent_reminders": 5
  }
}
```

### 11.2 Mobile Recent Transactions ? TESTED

**GET** /payment/mobile/recent-transactions/

**Description:** Recent payment transactions optimized for mobile view with essential details

**Query Parameters:**

- limit - Number of transactions to return (default: 10)

**Example:** GET /payment/mobile/recent-transactions/?limit=5

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "transaction_number": "TXN20251006000001",
      "amount": "25000.00",
      "payment_method_name": "UPI Payment",
      "dealer_name": "Maungiri Krishi Seva Kendra",
      "transaction_date": "2025-10-06T14:26:45.128127+05:30",
      "status": "approved",
      "status_display": "Approved"
    },
    {
      "id": 1,
      "transaction_number": "TXN20251005000001",
      "amount": "18500.00",
      "payment_method_name": "Bank Transfer",
      "dealer_name": "ABC Agricultural Supplies",
      "transaction_date": "2025-10-05T16:45:22.334567+05:30",
      "status": "completed",
      "status_display": "Completed"
    }
  ]
}
```

### 11.3 Mobile Urgent Reminders ? TESTED

**GET** /payment/mobile/urgent-reminders/

**Description:** Get urgent payment reminders for mobile alerts with priority classification

**Query Parameters:**

- limit - Number of reminders to return (default: 15)

**Example:** GET /payment/mobile/urgent-reminders/?limit=10

**Response:**

```json
{
  "success": true,
  "data": {
    "urgent_reminders": [
      {
        "id": 3,
        "payment_info": {
          "payment_number": "INV202510050001",
          "dealer_name": "Singh Agricultural Store",
          "amount": 45000.00
        },
        "reminder_type": "email",
        "scheduled_date": "2025-10-07T10:00:00+05:30",
        "status": "pending",
        "days_overdue": 125,
        "priority_level": "critical",
        "subject": "URGENT: Payment Overdue - Final Notice"
      },
      {
        "id": 5,
        "payment_info": {
          "payment_number": "INV202510040002",
          "dealer_name": "Rural Development Store",
          "amount": 28500.00
        },
        "reminder_type": "sms",
        "scheduled_date": "2025-10-07T09:00:00+05:30",
        "status": "scheduled",
        "days_overdue": 45,
        "priority_level": "high",
        "subject": "Payment Reminder - High Priority"
      }
    ],
    "summary": {
      "total_urgent": 8,
      "critical_priority": 2,
      "high_priority": 3,
      "medium_low_priority": 3
    }
  }
}
```

### 11.4 Mobile Dealer Summary ? TESTED

**GET** /payment/mobile/dealer/{dealer_id}/summary/

**Description:** Dealer-specific payment summary optimized for mobile view with comprehensive details

**Example:** GET /payment/mobile/dealer/1/summary/

**Response:**

```json
{
  "success": true,
  "data": {
    "dealer_info": {
      "id": 1,
      "name": "Ram Kumar",
      "shop_name": "Maungiri Krishi Seva Kendra",
      "mobile_number": "9876543210",
      "email": "ram.kumar@example.com",
      "address": "Main Market Road, Rajkot"
    },
    "outstanding_summary": {
      "total_outstanding": 45500.00,
      "overdue_amount": 15000.00,
      "current_due": 30500.00,
      "pending_invoices": 8,
      "overdue_invoices": 3
    },
    "recent_transactions": [
      {
        "id": 12,
        "transaction_number": "TXN20251006000012",
        "amount": "25000.00",
        "payment_method_name": "UPI Payment",
        "dealer_name": "Maungiri Krishi Seva Kendra",
        "transaction_date": "2025-10-06T14:26:45.128127+05:30",
        "status": "completed",
        "status_display": "Completed"
      },
      {
        "id": 8,
        "transaction_number": "TXN20251003000008",
        "amount": "18500.00",
        "payment_method_name": "Bank Transfer",
        "dealer_name": "Maungiri Krishi Seva Kendra",
        "transaction_date": "2025-10-03T11:15:30.567890+05:30",
        "status": "completed",
        "status_display": "Completed"
      }
    ],
    "payment_history": {
      "total_payments": 25,
      "total_invoiced": 285000.00,
      "total_paid": 239500.00,
      "average_payment_days": 18
    },
    "credit_info": {
      "credit_limit": 100000.00,
      "credit_used": 45500.00,
      "credit_available": 54500.00,
      "credit_utilization_percentage": 45.50
    }
  }
}
```

---
