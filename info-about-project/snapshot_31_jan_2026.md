🛡️ Yggdrasil Portal 2026: Project Baseline Snapshot
1. Context & Architecture
Name: Yggdrasil Portal (Project "Staff Portal 2026").

Stack: SAP CAP (Node.js) + UI5 Freestyle + Integration Cards (Component Type).

Pattern: Shell-Host-Card Architecture.

Integration Definition: A functional bundle of cards united by a common Host contract, shared context (Selected Employee), and thematic scope (e.g., "Magic Profile").

Core Principle: Lazy Loading. Cards are initialized only when their respective tab becomes active.

2. Infrastructure Layer (The SDK)
🛰️ Host & PubSub (epicHost)
Implementation: Located in Component.js.

PubSub: "Эфирный Резонантор" via sap.ui.base.EventProvider.

Context Bridge: setContext / getContext methods.

Persistence: Automatic synchronization between ui model and LocalStorage (keys: selectedID, currentTab).

Destinations: Centralized resolver for hrService (/odata/v4/hr), financeService (/finance), and projectService (/odata/v4/projects).

🛠️ BaseController (lib/sdkcard/Base.controller.js)
Role: Parent for all cards.

Key Methods:

getCard(): Access to __sapUiIntegration_card.

getCardHost(): Direct bridge to epicHost.

publish(eventName, data) / subscribe(eventName, handler): Event bus access.

setUIProperty(key, value): Updates global state and triggers storage persistence.

3. Orchestration Layer (Shell)
📜 Configuration (model/CardConfig.json)
Structure: Array of card objects with id, containerId, loadType (static/dynamic), tab (string or array), and manifest path.

Universal Pattern: Multiple entries (e.g., magicInfo, magicSalary) point to the same manifest but carry unique settings (e.g., featureKey).

🎮 Shell Controller (shell/Shell.controller.js)
Logic:

_initPortalCards(): Loads static cards + cards for the saved currentTab.

_loadCardsByTab(sTabKey): Filters configuration and triggers atomic loading.

_loadCardById(sCardId): Instantiates sap.ui.integration.widgets.Card and injects it into a VBox if empty.

4. Current Module State: "Swiss Army Knife" Card
Target: ProfileFeatureCard (The Universal Card).

Mechanism: Uses parameters in manifest.json (specifically featureKey) to determine its "personality".

Component.js State: Currently performs "Model Hijacking" (cloning models from the Shell component to itself) to ensure data availability.

Controller Logic: Designed to dynamically load XML Fragments (GeneralInfo, SalaryDetails, EquipmentList) based on the featureKey.

5. UI Layout Status (Shell.view.xml)
Staff Tab: staffFilterContainer, staffTableContainer.

Finance Tab: contextStripContainer, financeSection.

Registry Tab: projectRegistrySection.

Magic Profile Tab: magicProfileSection (contains 3 sub-containers: magicInfoSection, magicSalarySection, magicEquipmentSection).

Conditional Visibility: All sections are bound to ui>/currentTab.

6. Pending Tasks & Known Issues
Fragment Injection: ProfileFeatureCard needs logic to successfully resolve and load fragments.

Model Cleanup: Refine Component.js for ProfileFeatureCard to use a more standard parameters injection instead of searching the registry.

Project Assignments: Next big functional block to be implemented as a REST-resource consumer.