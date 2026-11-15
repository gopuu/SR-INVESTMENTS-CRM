# SOP 02: Tenant License Renewal & Subscription Management

**Document ID:** `SOP-CRM-SAAS-02`  
**Version:** `v2.5 (Production Live)`  
**Audience:** CRM Founder / Platform SuperAdmin  
**Format:** Markdown Companion (Full Word document: [`02_SOP_License_Renewal.docx`](./02_SOP_License_Renewal.docx))

---

## 1. Overview & Policy
Every client organization in the SR Investments CRM is governed by an active subscription record in the `Tenant_Licensing` sheet. License status directly controls workspace availability.

---

## 2. Subscription Tiers

| Tier | Standard Validity | Commercial Fee | Key Entitlements |
| :--- | :--- | :--- | :--- |
| **Starter** | 12 Months | ₹25,000 / yr | Up to 3 Staff, 1,000 Customers, Core Mutual Fund CRM |
| **Professional** | 12 Months | ₹60,000 / yr | Up to 15 Staff, 10,000 Customers, SIP Tracker, Reports |
| **Enterprise** | 12 / 24 Months | ₹1,20,000 / yr | Unlimited Staff & Customers, Priority SLA, Full Vault |

---

## 3. Step-by-Step License Renewal Workflow

### Step 1: Open Tenant Licensing Controls
1. Log in as SuperAdmin.
2. In the sidebar, click **Tenant Master (SaaS)**.
3. In the Client Directory table, find the target organization.
4. Click the **Licenses** button (credit card icon) in the Actions column.

### Step 2: Review Subscription History
1. The **Subscription & License History** drawer opens.
2. Check previous start dates, end dates, fees, and current status (`Active`, `Renewed`, or `Inactive`).

### Step 3: Record Renewal
1. In the **Add License / Renewal** form:
   - **License Type:** Confirm or upgrade tier.
   - **Start Date:** Effective start date of renewal.
   - **End Date:** Automatically set to 1 year ahead (or custom).
   - **Subscription Fee (₹):** Enter payment amount received.
   - **Status:** `Active`.
   - **Operational Notes:** Reference invoice, payment transaction ID, or agreement number.
2. Click **Save & Activate Renewal**.

### Step 4: System Automatic Transition
- Prior `Active` license records are automatically marked as `Renewed`.
- The new license becomes `Active` with `IsActive = TRUE`.
- The audit fields (`Updated_By`, `Updated_At`) log the renewal event.

---

## 4. Deactivation / Suspension Protocol
- If a client fails payment past the grace period (15 days), click **Deactivate** on the active license row.
- Soft deactivation sets `Status = Inactive` without deleting any customer or employee data.

