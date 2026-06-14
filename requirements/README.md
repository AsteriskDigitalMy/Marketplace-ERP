# Requirements Index

Frontend requirement documents for Marketplace-ERP modules. Each subsection is a separate markdown file with screens, UI components, mock data shapes, and acceptance criteria.

## Conventions

- **Scope:** Frontend only. All data is mocked to match NyxAPI response shapes (see `docs/nyxapi-route-reference.md`) and validated domain models in `src/models/`.
- **UI:** shadcn/ui components, brand palette `#002379`, patterns in `.cursor/rules/ui-ux-standards.mdc`.
- **States:** Every screen implements loading, empty, error, and success states.
- **BA/UX structure (Section 3.1 PMS):** Each requirement file includes **Phase 1** (personas, FR-xxx capabilities, edge cases), **Phase 2** (screen-by-screen field specs and functional logic), and **Phase 3** (transition flow table), followed by mock DTO shapes and acceptance criteria.
- **PDA / Pad views:** Mobile-first layouts at 360px for floor operations (scan-centric flows). WMS emphasizes PDA; MES emphasizes Pad terminals and workshop displays.

---

## 3.1 KPI / PMS — Performance Management System

KPI and Project Management subsystem: system administration, indicator library, project lifecycle, data collection, calculation engine, cockpits, alerts, appraisal, PDCA, and reports. Route prefix: `/pms/`. For read-only BI analytics, see [3.7 Business Intelligence](#37-business-intelligence-bi-visualization-dashboard).

### 3.1.1 System Basic Management

| # | File | Section |
|---|------|---------|
| 1 | [3.1.1.1-organizational-unit-creation.md](./3.1.1.1-organizational-unit-creation.md) | F-BASE-001 — Organizational unit creation |
| 2 | [3.1.1.2-organizational-unit-editing-disabling.md](./3.1.1.2-organizational-unit-editing-disabling.md) | F-BASE-002 — Org unit editing & disabling |
| 3 | [3.1.1.3-org-structure-version-rollback.md](./3.1.1.3-org-structure-version-rollback.md) | F-BASE-003 — Org structure version rollback |
| 4 | [3.1.1.4-system-account-creation.md](./3.1.1.4-system-account-creation.md) | F-BASE-004 — System account creation |
| 5 | [3.1.1.5-account-lifecycle-management.md](./3.1.1.5-account-lifecycle-management.md) | F-BASE-005 — Account lifecycle management |
| 6 | [3.1.1.6-role-permission-configuration.md](./3.1.1.6-role-permission-configuration.md) | F-BASE-006 — Role permission configuration |
| 7 | [3.1.1.7-user-role-binding.md](./3.1.1.7-user-role-binding.md) | F-BASE-007 — User role binding |
| 8 | [3.1.1.8-global-dictionary-maintenance.md](./3.1.1.8-global-dictionary-maintenance.md) | F-BASE-008 — Global dictionary maintenance |
| 9 | [3.1.1.9-operation-log-query.md](./3.1.1.9-operation-log-query.md) | F-BASE-009 — Operation log query |
| 10 | [3.1.1.10-system-parameter-settings.md](./3.1.1.10-system-parameter-settings.md) | F-BASE-010 — System parameter settings |

### 3.1.2 KPI Indicator Library Management

| # | File | Section |
|---|------|---------|
| 1 | [3.1.2.1-kpi-indicator-addition.md](./3.1.2.1-kpi-indicator-addition.md) | F-KPI-001 — New KPI indicator addition |
| 2 | [3.1.2.2-kpi-indicator-lifecycle.md](./3.1.2.2-kpi-indicator-lifecycle.md) | F-KPI-002 — Indicator edit/disable/delete |
| 3 | [3.1.2.3-kpi-formula-editor.md](./3.1.2.3-kpi-formula-editor.md) | F-KPI-003 — KPI formula visual editor |

### 3.1.3 Project Management

| # | File | Section |
|---|------|---------|
| 1 | [3.1.3.1-project-initiation.md](./3.1.3.1-project-initiation.md) | F-PROJ-001 — Project initiation |
| 2 | [3.1.3.2-project-initiation-approval.md](./3.1.3.2-project-initiation-approval.md) | F-PROJ-002 — Initiation approval |
| 3 | [3.1.3.3-sub-task-creation.md](./3.1.3.3-sub-task-creation.md) | F-PROJ-003 — Sub-task creation & assignment |
| 4 | [3.1.3.4-project-progress-updates.md](./3.1.3.4-project-progress-updates.md) | F-PROJ-004 — Multi-mode progress updates |
| 5 | [3.1.3.5-task-duration-change.md](./3.1.3.5-task-duration-change.md) | F-PROJ-005 — Task duration change |
| 6 | [3.1.3.6-issue-reporting.md](./3.1.3.6-issue-reporting.md) | F-PROJ-006 — Execution issue reporting |
| 7 | [3.1.3.7-issue-closed-loop.md](./3.1.3.7-issue-closed-loop.md) | F-PROJ-007 — Issue closed-loop handling |
| 8 | [3.1.3.8-kpi-data-sync.md](./3.1.3.8-kpi-data-sync.md) | F-PROJ-008 — Project data → KPI sync |
| 9 | [3.1.3.9-gantt-chart.md](./3.1.3.9-gantt-chart.md) | F-PROJ-009 — Automatic Gantt chart |
| 10 | [3.1.3.10-project-acceptance-initiation.md](./3.1.3.10-project-acceptance-initiation.md) | F-PROJ-010 — Acceptance application |
| 11 | [3.1.3.11-project-acceptance-approval.md](./3.1.3.11-project-acceptance-approval.md) | F-PROJ-011 — Acceptance approval |

### 3.1.4 Data Collection and Filling

| # | File | Section |
|---|------|---------|
| 1 | [3.1.4.1-periodic-filling-tasks.md](./3.1.4.1-periodic-filling-tasks.md) | F-DATA-001 — Periodic filling task push |
| 2 | [3.1.4.2-manual-data-entry.md](./3.1.4.2-manual-data-entry.md) | F-DATA-002 — Manual form data entry |
| 3 | [3.1.4.3-multi-level-data-review.md](./3.1.4.3-multi-level-data-review.md) | F-DATA-003 — Multi-level data review |

### 3.1.5 KPI Calculation and Statistical Analysis

| # | File | Section |
|---|------|---------|
| 1 | [3.1.5.1-scheduled-batch-calculation.md](./3.1.5.1-scheduled-batch-calculation.md) | F-CALC-001 — Scheduled batch calculation |
| 2 | [3.1.5.2-manual-recalculation.md](./3.1.5.2-manual-recalculation.md) | F-CALC-002 — Manual re-calculation |

### 3.1.6–3.1.10 Cockpit, Alerts, Appraisal, PDCA & Reports

| # | File | Section |
|---|------|---------|
| 1 | [3.1.6.1-role-cockpit-auto-loading.md](./3.1.6.1-role-cockpit-auto-loading.md) | F-DASH-001 — Role-specific cockpit auto loading |
| 2 | [3.1.6.2-cockpit-drill-down.md](./3.1.6.2-cockpit-drill-down.md) | F-DASH-002 — Cockpit hierarchical drill-down |
| 3 | [3.1.6.3-traffic-light-rules.md](./3.1.6.3-traffic-light-rules.md) | F-DASH-003 — Global traffic light color rules |
| 4 | [3.1.7.1-alert-rule-configuration.md](./3.1.7.1-alert-rule-configuration.md) | F-ALERT-001 — Alert trigger rule configuration |
| 5 | [3.1.7.2-alert-closed-loop-disposal.md](./3.1.7.2-alert-closed-loop-disposal.md) | F-ALERT-002 — Alert closed-loop disposal |
| 6 | [3.1.8.1-appraisal-scheme-configuration.md](./3.1.8.1-appraisal-scheme-configuration.md) | F-PERF-001 — Appraisal scheme configuration |
| 7 | [3.1.8.2-automatic-scoring-grading.md](./3.1.8.2-automatic-scoring-grading.md) | F-PERF-002 — Automatic scoring & grading |
| 8 | [3.1.8.3-preliminary-review-list.md](./3.1.8.3-preliminary-review-list.md) | F-PERF-003 — All-staff preliminary review list |
| 9 | [3.1.8.4-preliminary-review-shunting.md](./3.1.8.4-preliminary-review-shunting.md) | F-PERF-004 — Preliminary review & grade shunting |
| 10 | [3.1.8.5-hr-rectification.md](./3.1.8.5-hr-rectification.md) | F-PERF-005 — HR performance rectification |
| 11 | [3.1.8.6-secondary-confirmation.md](./3.1.8.6-secondary-confirmation.md) | F-PERF-006 — Secondary rectification confirmation |
| 12 | [3.1.8.7-executive-final-review.md](./3.1.8.7-executive-final-review.md) | F-PERF-007 — Executive final performance review |
| 13 | [3.1.9.1-pdca-proposal-submission.md](./3.1.9.1-pdca-proposal-submission.md) | F-PDCA-001 — Online PDCA proposal submission |
| 14 | [3.1.9.2-pdca-execution-tracking.md](./3.1.9.2-pdca-execution-tracking.md) | F-PDCA-002 — PDCA execution tracking |
| 15 | [3.1.10.1-standard-fixed-reports.md](./3.1.10.1-standard-fixed-reports.md) | F-RPT-001 — Industry standardized fixed reports |

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

---

## 3.6 SAP Financial System Integration

| # | File | Section |
|---|------|---------|
| 1 | [3.6.1-module-core-positioning.md](./3.6.1-module-core-positioning.md) | Module core positioning |
| 2 | [3.6.2-integration-architecture.md](./3.6.2-integration-architecture.md) | Integration architecture & specifications |
| 3 | [3.6.3-master-data-synchronization.md](./3.6.3-master-data-synchronization.md) | Master data synchronization |
| 4 | [3.6.4-procure-to-pay.md](./3.6.4-procure-to-pay.md) | Procure-to-Pay (P2P) integration |
| 5 | [3.6.5-order-to-cash.md](./3.6.5-order-to-cash.md) | Order-to-Cash (O2C) integration |
| 6 | [3.6.6-production-cost-accounting.md](./3.6.6-production-cost-accounting.md) | Production & cost accounting integration |
| 7 | [3.6.7-inventory-valuation.md](./3.6.7-inventory-valuation.md) | Inventory & stock valuation integration |
| 8 | [3.6.8-sync-monitoring-exceptions.md](./3.6.8-sync-monitoring-exceptions.md) | Sync monitoring & exception handling |

---

## 3.7 Business Intelligence (BI) Visualization Dashboard

| # | File | Section |
|---|------|---------|
| 1 | [3.7.1-module-core-positioning.md](./3.7.1-module-core-positioning.md) | Module core positioning |
| 2 | [3.7.2.1-strategic-executive-cockpit.md](./3.7.2.1-strategic-executive-cockpit.md) | Strategic layer — group management cockpit |
| 3 | [3.7.2.2-scm-dashboard.md](./3.7.2.2-scm-dashboard.md) | Operational layer — SCM dashboard |
| 4 | [3.7.2.3-mes-dashboard.md](./3.7.2.3-mes-dashboard.md) | Operational layer — MES dashboard |
| 5 | [3.7.2.4-wms-dashboard.md](./3.7.2.4-wms-dashboard.md) | Operational layer — WMS dashboard |
| 6 | [3.7.2.5-sap-financial-dashboard.md](./3.7.2.5-sap-financial-dashboard.md) | Operational layer — SAP financial dashboard |
| 7 | [3.7.2.6-kpi-pms-dashboard.md](./3.7.2.6-kpi-pms-dashboard.md) | Operational layer — KPI/PMS dashboard |
| 8 | [3.7.2.7-execution-site-kanban.md](./3.7.2.7-execution-site-kanban.md) | Execution layer — site electronic kanban |
| 9 | [3.7.3-rt-olap-engine.md](./3.7.3-rt-olap-engine.md) | Real-time performance (RT-OLAP) engine |
| 10 | [3.7.4-custom-reporting-self-service.md](./3.7.4-custom-reporting-self-service.md) | Custom reporting & self-service analysis |
| 11 | [3.7.5-alerts-trend-forecasting.md](./3.7.5-alerts-trend-forecasting.md) | Exception alerts & AI trend forecasting |
| 12 | [3.7.6-multi-terminal-layout.md](./3.7.6-multi-terminal-layout.md) | UI layout & multi-terminal adaptation |
