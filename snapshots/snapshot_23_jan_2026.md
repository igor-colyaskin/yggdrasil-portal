# Yggdrasil Portal - Snapshot v.23 Jan 2026

## 🏗 System Architecture
- **Shell**: Main entry point (`webapp/Component.js`). Hosts all cards.
- **Host**: `epicHost` (custom `sap.ui.integration.Host`).
- **Communication Hub**: "Эфирный Резонантор" (EtherResonator.js) injected into the Host instance.
- **State Management**: Host Shared Context (property: `currentTab`).

## 📁 Key File Map
- `webapp/shell/`: Shell View & Controller (Layout logic).
- `webapp/lib/sdkcard/`: Base classes for all cards to inherit PubSub logic.
- `webapp/helpers/`: 
    - `EtherResonator.js`: PubSub logic (attachEvent/fireEvent).
    - `CardManager.js`: Logic for managing card visibility and loading.

## 📡 Data Services (CAP)
1. **HRService (v4)**: `/odata/v4/hr` -> Entities: `Staff` (Employees).
2. **FinanceService (v2)**: `/finance` -> Entities: `Payrolls`, `Assets`.
3. **ProjectService (v4/REST)**: `/odata/v4/projects` -> Entities: `Assignments`.

## 🔄 Current State
- [x] Shell and HeaderCard connected.
- [x] Host-to-Card communication established.
- [x] Context management (currentTab) initialized in Host.
- [ ] StaffTable (v4) integration (Next Step).
- [ ] FilterCard to StaffTable signal via Resonator (Next Step).

## 💡 Dev Rules
- All cards must be of type `Component`.
- Communication between cards ONLY via `epicHost`.
- Use `Base.controller.js` for all card controllers.