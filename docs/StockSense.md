## Problem Statement - StockSense

Build a modular Inventory Management System (IMS) that digitizes and streamlines all stock-related oper- ations within a business. The goal is to replace manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time, easy-to-use app.

## Target Users

- Inventory Managers – manage incoming & outgoing stock.

- Warehouse Staff – perform transfers, picking, shelving, and counting.

## Authentication

- The user signs up/logs in.

- OTP-based password reset.

- Redirected to Inventory Dashboard.

## Dashboard View

The landing page shows a snapshot of inventory operations.

## Dashboard KPIs

- Total Products in Stock

- Low Stock / Out of Stock Items

- Pending Receipts

- Pending Deliveries

- Internal Transfers Scheduled

## Dynamic Filters

- By document type: Receipts / Delivery / Internal / Adjustments

- By status: Draft, Waiting, Ready, Done, Canceled

- By warehouse or location

- By product category


## Navigation

- 1. Products

- Create/update products.

- Stock availability per location.

- Product categories.

- Reordering rules.

- 2. Operations

- 1. Receipts (Incoming Stock)

- 2. Delivery Orders (Outgoing Stock)

- 3. Inventory Adjustment

- 4. Move History

- 5. Dashboard

- 6. Setting

- Warehouse

- 7. Profile Menu (Left Sidebar)

- My Profile

- Logout

## Core Features

## 1. Product Management

- Create products with:

- Name

- SKU / Code

- Category

- Unit of Measure

- Initial stock (optional)

## 2. Receipts (Incoming Goods)

Used when items arrive from vendors.

## Process:

- 1. Create a new receipt.

- 2. Add supplier & products.

- 3. Input quantities received.

- 4. Validate → stock increases automatically.

## Example:

- Receive 50 units of “Steel Rods” → stock +50.


## 3. Delivery Orders (Outgoing Goods)

Used when stock leaves the warehouse for customer shipment.

## Process:

- 1. Pick items.

- 2. Pack items.

- 3. Validate → stock decreases automatically.

## Example:

- Sales order for 10 chairs → Delivery order reduces chairs by 10.

## 4. Internal Transfers

Move stock inside the company:

## Example:

- Main Warehouse → Production Floor

- Rack A → Rack B

- Warehouse 1 → Warehouse 2

Each movement is logged in the ledger.

## 5. Stock Adjustments

Fix mismatches between:

- 1. Recorded stock

- 2. Physical count

## Steps:

- Select product/location

- Enter counted quantity

- System auto-updates and logs the adjustment

## Additional Features

- Alerts for low stock

- Multi-warehouse support

- SKU search & smart filters

## Simplified Example to Understand Inventory Flow

Step 1 : Receive Goods from Vendor

- Receive 100 kg Steel

- Stock: +100


Step 2 : Move to production rack

• Internal transfer: Main Store → Production Rack

◦ Stock unchanged in total, but new location updated

Step 3 : Deliver finished goods

• Deliver 20 steel

◦ Stock for frames: –20

Step 4 : Adjust damaged items

• 3 kg steel damaged

→ Stock: –3

Everything logged in the Stock Ledger.

## Mock up - https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R
