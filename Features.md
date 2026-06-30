# Required E-Commerce Admin Backend Features

This document outlines the essential admin backend features required for managing, auditing, and scaling the e-commerce platform. These features map directly to the modules stubbed out in `ECommerce.Api/Modules`.

---

## 1. Dashboard & Analytics (`Modules/Dashboard`)
Provides high-level metrics and health-check summaries of the store.
- **Store KPIs:** Calculate real-time metrics including:
  - Total Revenue
  - Total Orders
  - Average Order Value (AOV)
  - New User Registrations
- **Trends:** Sales and revenue charts grouped daily, weekly, or monthly.
- **Low Stock Board:** Identify and display products that have fallen below their safety thresholds.

---

## 2. Catalog Management (`Modules/Catalog`)
Allows complete control over what is sold on the storefront.
- **Products CRUD:** Add, update, and soft-delete products. Includes:
  - Managing prices (base cost, compare-at, selling price).
  - Editing metadata (descriptions, tags, weights, dimensions).
- **Media Manager:** Upload, order, and remove product images.
- **Categories & Brands CRUD:** Manage categories (supporting sub-categories) and brands.
- **SEO Slugs:** Automatic URL-friendly slug generation from item names.

---

## 3. Order & Fulfillment Management (`Modules/Orders` & `Payments`)
Handles purchasing, shipping, and payment status tracking.
- **Order Pipeline:** List, query, and search orders by customer, status, or date range.
- **Fulfillment Operations:** Progress orders through lifecycle statuses:
  - `Pending` → `Paid` → `Processing` → `Shipped` → `Delivered` or `Cancelled`.
- **Payment Audit:** Log and inspect payment gateway responses, transaction reference IDs, and payment methods.
- **Refunds:** Trigger manual or automated partial/full order cancellations and refunds.

---

## 4. Stock & Inventory Management (`Modules/Inventory`)
Maintains precise stock control and prevents over-selling.
- **Inventory Ledger:** Log every transaction detail modifying stock:
  - Positive changes: Restocking, customer returns.
  - Negative changes: Checkout sales, damage adjustments.
- **Manual Adjustments:** Admin-specific endpoints to force manual stock counts.

---

## 5. Marketing & Promotion Management (`Modules/Coupons`)
Powers customer acquisition and discount campaigns.
- **Coupon Manager:** Create and update discount coupons:
  - Fixed-amount discount or percentage-based discount.
  - Expiration dates and activity status.
  - Customer limits (e.g., limit to one use per customer).
  - Minimum purchase requirements.

---

## 6. Access Control & User Administration (`Modules/Users` & `Admin`)
Secures the backend and monitors store users.
- **Role-Based Access Control (RBAC):** Assign permissions dynamically (read/create/update/delete) per module.
- **Staff Accounts:** Manage backend logins and assign roles.
- **Customer Audit:** Browse customer registries, view individual purchase histories, and activate/deactivate accounts.

---

## 7. Review Moderation (`Modules/Reviews`)
Controls user-generated content on the storefront.
- **Review Moderation Queue:** Approve, hide, or flag reviews submitted by customers.
- **Admin Responses:** Allow staff to reply to customer feedback directly.
