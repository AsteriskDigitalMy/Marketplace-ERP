# Requirements Index

Frontend requirement documents for Marketplace-ERP modules. Each subsection is a separate markdown file with screens, UI components, mock data shapes, and acceptance criteria.

## Conventions

- **Scope:** Frontend only. All data is mocked to match NyxAPI response shapes (see `docs/nyxapi-route-reference.md`).
- **UI:** shadcn/ui components, brand palette `#002379`, patterns in `.cursor/rules/ui-ux-standards.mdc`.
- **States:** Every screen implements loading, empty, error, and success states.
- **PDA / Pad views:** Mobile-first layouts at 360px for floor operations (scan-centric flows). WMS emphasizes PDA; MES emphasizes Pad terminals and workshop displays.

---

## 3.2 Product Data Management (PDM/ePDM/GST)

| # | File | Section |
|---|------|---------|
| 1 | [3.2.1-module-core-positioning.md](./3.2.1-module-core-positioning.md) | Module core positioning |
| 2 | [3.2.2.1-product-project-initiation.md](./3.2.2.1-product-project-initiation.md) | Product project initiation |
| 3 | [3.2.2.2-product-design-management.md](./3.2.2.2-product-design-management.md) | Product design management |
| 4 | [3.2.2.3-end-to-end-sampling-management.md](./3.2.2.3-end-to-end-sampling-management.md) | End-to-end sampling (ePDM core) |
| 5 | [3.2.2.4-product-finalization-archiving.md](./3.2.2.4-product-finalization-archiving.md) | Product finalization & archiving |
| 6 | [3.2.3.1-standard-process-library.md](./3.2.3.1-standard-process-library.md) | Standard process library |
| 7 | [3.2.3.2-operation-standard-working-hours.md](./3.2.3.2-operation-standard-working-hours.md) | Operation standard working hours |
| 8 | [3.2.3.3-product-routing-management.md](./3.2.3.3-product-routing-management.md) | Product routing management |
| 9 | [3.2.3.4-process-scheduling-guidance.md](./3.2.3.4-process-scheduling-guidance.md) | Process scheduling & guidance |
| 10 | [3.2.4-bom-material-management.md](./3.2.4-bom-material-management.md) | BOM material management |
| 11 | [3.2.5-product-cost-pricing.md](./3.2.5-product-cost-pricing.md) | Product cost pricing |
| 12 | [3.2.6-version-change-management.md](./3.2.6-version-change-management.md) | Version & change management |

---

## 3.3 Supply Chain Management (SCM)

| # | File | Section |
|---|------|---------|
| 1 | [3.3.1-module-core-positioning.md](./3.3.1-module-core-positioning.md) | Module core positioning |
| 2 | [3.3.2.1-customer-master-data.md](./3.3.2.1-customer-master-data.md) | Customer & master data management |
| 3 | [3.3.2.2-sales-order-creation.md](./3.3.2.2-sales-order-creation.md) | Sales order creation & management |
| 4 | [3.3.2.3-order-review.md](./3.3.2.3-order-review.md) | Multi-dimensional order review |
| 5 | [3.3.2.4-order-change.md](./3.3.2.4-order-change.md) | Order change management |
| 6 | [3.3.2.5-order-tracking.md](./3.3.2.5-order-tracking.md) | End-to-end order tracking |
| 7 | [3.3.2.6-order-shipment-closure.md](./3.3.2.6-order-shipment-closure.md) | Order shipment & closure |
| 8 | [3.3.3.1-supplier-management.md](./3.3.3.1-supplier-management.md) | Supplier management |
| 9 | [3.3.3.2-procurement-demand-requisition.md](./3.3.3.2-procurement-demand-requisition.md) | Procurement demand & requisition |
| 10 | [3.3.3.3-purchase-order.md](./3.3.3.3-purchase-order.md) | Purchase order management |
| 11 | [3.3.3.4-procurement-arrival-iqc.md](./3.3.3.4-procurement-arrival-iqc.md) | Procurement arrival & IQC |
| 12 | [3.3.3.5-purchase-reconciliation-settlement.md](./3.3.3.5-purchase-reconciliation-settlement.md) | Purchase reconciliation & settlement |
| 13 | [3.3.4.1-demand-resource-management.md](./3.3.4.1-demand-resource-management.md) | Demand & resource management |
| 14 | [3.3.4.2-intelligent-scheduling-engine.md](./3.3.4.2-intelligent-scheduling-engine.md) | Intelligent scheduling engine |
| 15 | [3.3.4.3-scheduling-visualization.md](./3.3.4.3-scheduling-visualization.md) | Scheduling visualization & adjustment |
| 16 | [3.3.4.4-schedule-dispatch-rolling.md](./3.3.4.4-schedule-dispatch-rolling.md) | Schedule dispatch & rolling updates |
| 17 | [3.3.4.5-urgent-orders-changes.md](./3.3.4.5-urgent-orders-changes.md) | Urgent orders & change processing |
| 18 | [3.3.4.6-plan-achievement-pdca.md](./3.3.4.6-plan-achievement-pdca.md) | Plan achievement analysis & PDCA |
| 19 | [3.3.5-subcontracting.md](./3.3.5-subcontracting.md) | Subcontracting & collaborative manufacturing |
| 20 | [3.3.6-import-export-shipping.md](./3.3.6-import-export-shipping.md) | Import/export & shipping management |

---

## 3.4 Manufacturing Execution System (MES)

| # | File | Section |
|---|------|---------|
| 1 | [3.4.1-module-core-positioning.md](./3.4.1-module-core-positioning.md) | Module core positioning |
| 2 | [3.4.2.1-work-order-reception-creation.md](./3.4.2.1-work-order-reception-creation.md) | Work order reception & creation |
| 3 | [3.4.2.2-work-order-splitting-merging.md](./3.4.2.2-work-order-splitting-merging.md) | Work order splitting & merging |
| 4 | [3.4.2.3-work-order-dispatch-material-picking.md](./3.4.2.3-work-order-dispatch-material-picking.md) | Work order dispatch & material picking |
| 5 | [3.4.2.4-work-order-production-reporting.md](./3.4.2.4-work-order-production-reporting.md) | Work order production reporting (Bao-Gong) |
| 6 | [3.4.2.5-work-order-status-closure.md](./3.4.2.5-work-order-status-closure.md) | Work order status & closure |
| 7 | [3.4.3-workshop-scheduling.md](./3.4.3-workshop-scheduling.md) | Workshop planning & line scheduling |
| 8 | [3.4.4.1-cutting-process.md](./3.4.4.1-cutting-process.md) | Cutting process management |
| 9 | [3.4.4.2-sewing-hanging-line.md](./3.4.4.2-sewing-hanging-line.md) | Sewing & hanging line management |
| 10 | [3.4.4.3-post-processing-packaging.md](./3.4.4.3-post-processing-packaging.md) | Post-processing & packaging |
| 11 | [3.4.4.4-wip-rfid-traceability.md](./3.4.4.4-wip-rfid-traceability.md) | Full-process WIP RFID traceability |
| 12 | [3.4.5.1-ipqc.md](./3.4.5.1-ipqc.md) | In-process quality control (IPQC) |
| 13 | [3.4.5.2-oqc.md](./3.4.5.2-oqc.md) | Outgoing quality control (OQC) |
| 14 | [3.4.5.3-rework-repair.md](./3.4.5.3-rework-repair.md) | Rework & repair management |
| 15 | [3.4.5.4-quality-traceability-analysis.md](./3.4.5.4-quality-traceability-analysis.md) | Quality traceability & analysis |
| 16 | [3.4.6.1-equipment-ledger.md](./3.4.6.1-equipment-ledger.md) | Equipment ledger management |
| 17 | [3.4.6.2-equipment-status-monitoring.md](./3.4.6.2-equipment-status-monitoring.md) | Real-time equipment status monitoring |
| 18 | [3.4.6.3-equipment-maintenance.md](./3.4.6.3-equipment-maintenance.md) | Equipment maintenance management |
| 19 | [3.4.6.4-equipment-oee.md](./3.4.6.4-equipment-oee.md) | Equipment OEE calculation & analysis |
| 20 | [3.4.6.5-tooling-management.md](./3.4.6.5-tooling-management.md) | Tooling & industrial tool management |
| 21 | [3.4.7.1-personnel-team-management.md](./3.4.7.1-personnel-team-management.md) | Personnel & team management |
| 22 | [3.4.7.2-labor-hour-output-collection.md](./3.4.7.2-labor-hour-output-collection.md) | Labor hour & output data collection |
| 23 | [3.4.7.3-piece-rate-wage-calculation.md](./3.4.7.3-piece-rate-wage-calculation.md) | Piece-rate wage automatic calculation |
| 24 | [3.4.8-production-cost-management.md](./3.4.8-production-cost-management.md) | Production cost fine-grained management |
| 25 | [3.4.9-production-statistics-reports.md](./3.4.9-production-statistics-reports.md) | Production data statistics & reports |

---

## 3.5 Warehouse Management System (WMS)

| # | File | Section |
|---|------|---------|
| 1 | [3.5.1-module-core-positioning.md](./3.5.1-module-core-positioning.md) | Module core positioning |
| 2 | [3.5.2.1-warehouse-zone-location.md](./3.5.2.1-warehouse-zone-location.md) | Warehouse / zone / location management |
| 3 | [3.5.2.2-material-master-data.md](./3.5.2.2-material-master-data.md) | Material master data (warehouse attributes) |
| 4 | [3.5.2.3-warehouse-strategy-configuration.md](./3.5.2.3-warehouse-strategy-configuration.md) | Warehouse strategy configuration |
| 5 | [3.5.3.1-purchase-inbound.md](./3.5.3.1-purchase-inbound.md) | Purchase inbound management |
| 6 | [3.5.3.2-production-output-inbound.md](./3.5.3.2-production-output-inbound.md) | Production output inbound |
| 7 | [3.5.3.3-miscellaneous-inbound.md](./3.5.3.3-miscellaneous-inbound.md) | Miscellaneous inbound |
| 8 | [3.5.4.1-production-material-picking.md](./3.5.4.1-production-material-picking.md) | Production material picking & issuance |
| 9 | [3.5.4.2-sales-shipping-outbound.md](./3.5.4.2-sales-shipping-outbound.md) | Sales shipping outbound |
| 10 | [3.5.4.3-miscellaneous-outbound.md](./3.5.4.3-miscellaneous-outbound.md) | Miscellaneous outbound |
| 11 | [3.5.5.1-inventory-transfer.md](./3.5.5.1-inventory-transfer.md) | Inventory transfer management |
| 12 | [3.5.5.2-inventory-alert.md](./3.5.5.2-inventory-alert.md) | Inventory alert management |
| 13 | [3.5.5.3-batch-shelf-life-control.md](./3.5.5.3-batch-shelf-life-control.md) | Batch & shelf-life control |
| 14 | [3.5.5.4-inventory-reservation-freezing.md](./3.5.5.4-inventory-reservation-freezing.md) | Inventory reservation & freezing |
| 15 | [3.5.6-inventory-counting.md](./3.5.6-inventory-counting.md) | Inventory counting (stock-taking) |
| 16 | [3.5.7-material-traceability.md](./3.5.7-material-traceability.md) | Full-process material traceability |
| 17 | [3.5.8-statistics-reports.md](./3.5.8-statistics-reports.md) | Warehousing statistics & reports |
