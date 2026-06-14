# PDM/ePDM/GST Module — Frontend Requirements

Section **3.2 Product Data Management** broken into frontend requirement documents.

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

## Conventions

- **Scope:** Frontend only. All data is mocked to match NyxAPI response shapes (see `docs/nyxapi-route-reference.md`).
- **UI:** shadcn/ui components, brand palette `#002379`, patterns in `.cursor/rules/ui-ux-standards.mdc`.
- **States:** Every screen implements loading, empty, error, and success states.
