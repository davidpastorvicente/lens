# Dynamic CRD Registration System

This document explains how to use the dynamic CRD (Custom Resource Definition) registration system in Lens to easily add new Kubernetes resource groups to the sidebar with minimal code.

## Table of Contents

- [Overview](#overview)
- [Adding a New Resource Group](#adding-a-new-resource-group)
  - [Step 1: Create Configuration File](#step-1-create-configuration-file)
  - [Step 2: Add Icon SVG](#step-2-add-icon-svg)
  - [Step 3: Register Icon](#step-3-register-icon)
  - [Step 4: Register Configuration](#step-4-register-configuration)
  - [Step 5: Build and Test](#step-5-build-and-test)
- [Configuration Reference](#configuration-reference)
- [Generated Routes](#generated-routes)
- [Examples](#examples)
  - [ArgoCD (Current Implementation)](#argocd-current-implementation)
  - [VPA (Example)](#vpa-example---icon-needed)
  - [Keda (Example)](#keda-example---icon-needed)
- [How It Works](#how-it-works)
  - [CRD Auto-Detection](#crd-auto-detection)
  - [Reactive Updates](#reactive-updates)
- [Customization](#customization)
  - [Custom UI Columns](#custom-ui-columns)
  - [Custom Resource Methods](#custom-resource-methods)
  - [Mixing Dynamic and Custom Resources](#mixing-dynamic-and-custom-resources)
  - [Adding Custom Styles](#adding-custom-styles)
- [Troubleshooting](#troubleshooting)
- [Benefits](#benefits)
- [Quick Reference: Icon Setup Checklist](#quick-reference-icon-setup-checklist)

## Overview

The dynamic CRD system allows you to register entire groups of related CRDs (like ArgoCD, VPA, Keda, etc.) with a simple configuration. **Resource metadata is automatically detected from installed CRDs** - you only need to specify the resource `kind`.

The system automatically generates:

- **API endpoints** - KubeApi instances for each resource
- **Stores** - KubeObjectStore instances for data management
- **Routes** - Front-end routes for navigation
- **Navigation functions** - Helper functions for routing
- **UI components** - React components using KubeObjectListLayout
- **Sidebar items** - Parent group + child items for each resource

## Adding a New Resource Group

### Step 1: Create Configuration File

Create a new file in `common/managed-resources/`:

```typescript
// vpa-resource-group.config.ts
import type { ManagedResourceGroupConfig } from "./managed-resource-group";

export const vpaResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "vpa",                           // Unique ID for the group
  displayName: "VPA",                  // Display name in sidebar
  icon: "vpa",                         // Icon name (must be registered in icon.tsx)
  orderNumber: 92,                     // Sidebar position (higher = lower in list)
  apiGroup: "autoscaling.k8s.io",      // API group to search for CRDs
  resources: [
    {
      kind: "VerticalPodAutoscaler",
      displayName: "VPA",
      // Static fallback (optional but recommended)
      apiVersion: "v1",                // Just the version part
      pluralName: "verticalpodautoscalers",
      namespaced: true,
    },
    {
      kind: "VerticalPodAutoscalerCheckpoint",
      displayName: "VPA Checkpoints",
      apiVersion: "v1",
      pluralName: "verticalpodautoscalercheckpoints",
      namespaced: true,
    },
  ],
};
```

**Static vs Dynamic:**
- **With static metadata** (as shown above): Sidebar always visible, works immediately
- **Without static metadata** (only `kind`): Sidebar appears only when CRDs are detected

The system automatically combines `apiGroup: "autoscaling.k8s.io"` + `apiVersion: "v1"` → `"autoscaling.k8s.io/v1"`

### Step 2: Add Icon SVG

Every resource group needs an icon. Add an SVG file to `renderer/components/icon/`:

**Example: `vpa.svg`**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
</svg>
```

### Step 3: Register Icon

Register your icon in `renderer/components/icon/icon.tsx`:

**1. Import the SVG:**
```typescript
import VPA from "./vpa.svg";
```

**2. Add to localSvgIcons Map (around line 53):**
```typescript
const localSvgIcons = new Map<string, string>([
  // ... existing icons
  ["argoCD", ArgoCD],
  ["vpa", VPA],  // Add your icon here
]);
```

**3. Add to NamedSvg type (around line 79):**
```typescript
export type NamedSvg =
  | "spinner"
  | "argoCD"
  | "vpa"  // Add your icon name here
  // ... other icons
```

### Step 4: Register Configuration

Add your config to `common/managed-resources/managed-resource-groups.injectable.ts`:

Add your config to `common/managed-resources/managed-resource-groups.injectable.ts`:

```typescript
import { argoCDResourceGroupConfig } from "./argocd-resource-group.config";
import { vpaResourceGroupConfig } from "./vpa-resource-group.config";

const managedResourceGroupsInjectable = getInjectable({
  id: "managed-resource-groups",
  instantiate: (): ManagedResourceGroupConfig[] => [
    argoCDResourceGroupConfig,
    vpaResourceGroupConfig,  // Add here
  ],
  lifecycle: lifecycleEnum.singleton,
});
```

### Step 5: Build and Test

```bash
npm run build
npm run dev
```

The resource group will appear in the sidebar **only if the CRDs are installed** in your cluster.

## Configuration Reference

### ManagedResourceGroupConfig

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (kebab-case recommended) |
| `displayName` | string | Name shown in sidebar |
| `icon` | string | Icon identifier from icon.tsx |
| `orderNumber` | number | Sidebar position (90-99 recommended) |
| `apiGroup` | string | Kubernetes API group to search (e.g., "argoproj.io") |
| `resources` | ManagedResourceConfig[] | Array of resources in this group |

### ManagedResourceConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `kind` | string | ✅ Yes | Kubernetes resource kind (e.g., "Application") |
| `displayName` | string | ❌ No | Display name in UI (defaults to `kind`) |
| `apiVersion` | string | ❌ No | Version only (e.g., "v1alpha1"). If provided, enables static fallback |
| `pluralName` | string | ❌ No | Plural name (e.g., "applications"). If provided, enables static fallback |
| `namespaced` | boolean | ❌ No | Whether namespaced. If provided, enables static fallback |

**Two modes:**

1. **Dynamic (CRD Auto-Detection)** - Only specify `kind`:
   ```typescript
   { kind: "Application", displayName: "Applications" }
   ```
   The system searches installed CRDs matching the group's `apiGroup` and extracts all metadata.

2. **Static Fallback** - Provide all metadata:
   ```typescript
   {
     kind: "Application",
     displayName: "Applications",
     apiVersion: "v1alpha1",        // Just the version part
     pluralName: "applications",
     namespaced: true,
   }
   ```
   Sidebar always appears, even if CRDs not yet loaded. The `group` is automatically derived from the parent config's `apiGroup`.

**Note:** The full `apiVersion` (e.g., "argoproj.io/v1alpha1") is constructed by combining the parent's `apiGroup` with the resource's `apiVersion`.

## Generated Routes

Resources are automatically accessible at:

```
/cluster/{groupId}/{pluralName}
```

Examples:
- `/argocd/applications`
- `/argocd/appprojects`
- `/argocd/applicationsets`
- `/vpa/verticalpodautoscalers`

## Examples

### ArgoCD (Current Implementation)

File: `common/managed-resources/argocd-resource-group.config.ts`

```typescript
export const argoCDResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "argocd",
  displayName: "ArgoCD",
  icon: "argoCD",  // ✅ Icon already exists and registered!
  orderNumber: 91,
  apiGroup: "argoproj.io",
  resources: [
    {
      kind: "Application",
      displayName: "Applications",
      apiVersion: "v1alpha1",      // Static fallback
      pluralName: "applications",
      namespaced: true,
    },
    {
      kind: "AppProject",
      displayName: "Projects",
      apiVersion: "v1alpha1",
      pluralName: "appprojects",
      namespaced: true,
    },
    {
      kind: "ApplicationSet",
      displayName: "ApplicationSets",
      apiVersion: "v1alpha1",
      pluralName: "applicationsets",
      namespaced: true,
    },
  ],
};
```

**Icon:** The ArgoCD icon (`argocd.svg`) is already created and registered in:
- **SVG file:** `packages/core/src/renderer/components/icon/argocd.svg`
- **Registered in:** `packages/core/src/renderer/components/icon/icon.tsx`

**Note:** This uses static fallback mode to ensure the sidebar always appears.

### VPA (Example - Icon needed)

**Config:**
```typescript
export const vpaResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "vpa",
  displayName: "VPA",
  icon: "vpa",  // ⚠️ Need to create vpa.svg and register it
  orderNumber: 92,
  apiGroup: "autoscaling.k8s.io",
  resources: [
    { kind: "VerticalPodAutoscaler" },
    { kind: "VerticalPodAutoscalerCheckpoint", displayName: "Checkpoints" },
  ],
};
```

**Required:** Create `vpa.svg` and register in `icon.tsx`

### Keda (Example - Icon needed)

```typescript
export const kedaResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "keda",
  displayName: "Keda",
  icon: "keda",
  orderNumber: 93,
  apiGroup: "keda.sh",
  resources: [
    { kind: "ScaledObject" },
    { kind: "ScaledJob" },
    { kind: "TriggerAuthentication" },
    { kind: "ClusterTriggerAuthentication" },
  ],
};
```

## How It Works

### CRD Auto-Detection

When Lens starts:

1. System reads your resource group configs
2. Watches `CustomResourceDefinitionStore` for installed CRDs
3. For each resource in your config:
   - Searches for CRD matching `kind` and `apiGroup`
   - Extracts metadata: `apiVersion`, `pluralName`, `namespaced`
   - Creates enriched config with all metadata
4. Generates all injectables dynamically
5. Registers with Lens DI system

### Reactive Updates

The system uses MobX `reaction()` to watch for:
- **Config changes** - Add/remove resource groups
- **CRD changes** - CRDs installed/uninstalled in cluster

When changes occur, injectables are automatically regenerated.

## Customization

While the dynamic system provides a working UI out-of-the-box, you can customize both the display and functionality for specific resources.

### Custom UI Columns

The default `ManagedResourceList` component shows 3 columns: Name, Namespace, and Age. To add custom columns (like Status, Replicas, etc.), create a custom component.

#### Example: ArgoCD Applications with Sync Status

**1. Create Custom Component** (`argocd-applications-custom.tsx`):

```typescript
import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectAge } from "../kube-object/age";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import type { CustomResourceStore } from "../../../common/k8s-api/api-manager/resource.store";
import type { KubeObject } from "@k8slens/kube-object";

enum columnId {
  name = "name",
  namespace = "namespace",
  syncStatus = "sync-status",
  healthStatus = "health-status",
  age = "age",
}

export interface ArgoCDApplicationsListProps {
  store: CustomResourceStore<KubeObject>;
}

export const ArgoCDApplicationsList = observer(({ store }: ArgoCDApplicationsListProps) => {
  return (
    <KubeObjectListLayout
      isConfigurable
      tableId="argocd-applications"
      className="ArgoCDApplications"
      store={store}
      sortingCallbacks={{
        [columnId.name]: item => item.getName(),
        [columnId.namespace]: item => item.getNs(),
        [columnId.syncStatus]: item => item.status?.sync?.status || "",
        [columnId.healthStatus]: item => item.status?.health?.status || "",
        [columnId.age]: item => -item.getCreationTimestamp(),
      }}
      searchFilters={[
        item => item.getSearchFields(),
        item => item.status?.sync?.status,
        item => item.status?.health?.status,
      ]}
      renderHeaderTitle="Applications"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Sync Status", className: "sync-status", sortBy: columnId.syncStatus, id: columnId.syncStatus },
        { title: "Health", className: "health-status", sortBy: columnId.healthStatus, id: columnId.healthStatus },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={item => {
        const syncStatus = item.status?.sync?.status || "Unknown";
        const healthStatus = item.status?.health?.status || "Unknown";
        
        return [
          item.getName(),
          <NamespaceSelectBadge key="namespace" namespace={item.getNs() || ""} />,
          <span key="sync" className={`sync-status-${syncStatus.toLowerCase()}`}>
            {syncStatus}
          </span>,
          <span key="health" className={`health-status-${healthStatus.toLowerCase()}`}>
            <KubeObjectStatusIcon
              key="icon"
              object={item}
              status={healthStatus}
            />
            {healthStatus}
          </span>,
          <KubeObjectAge key="age" object={item} />,
        ];
      }}
    />
  );
});
```

**2. Create Custom Route Component Factory**:

Instead of using the generic `createManagedResourceRouteComponentInjectable`, create a specific one:

```typescript
// argocd-applications-route-component.injectable.tsx
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { ArgoCDApplicationsList } from "./argocd-applications-custom";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import argoCDApplicationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/argocd/applications/argocd-applications-route.injectable";
import argoCDApplicationsStoreInjectable from "./store.injectable";

const argoCDApplicationsRouteComponentInjectable = getInjectable({
  id: "argocd-applications-route-component",
  instantiate: (di) => ({
    route: di.inject(argoCDApplicationsRouteInjectable),
    Component: () => {
      const store = di.inject(argoCDApplicationsStoreInjectable);
      
      return <ArgoCDApplicationsList store={store} />;
    },
  }),
  injectionToken: routeSpecificComponentInjectionToken,
});

export default argoCDApplicationsRouteComponentInjectable;
```

**3. Exclude from Dynamic System**:

When you want manual control for specific resources, filter them out in your config:

```typescript
export const argoCDResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "argocd",
  displayName: "ArgoCD",
  icon: "argoCD",
  orderNumber: 91,
  apiGroup: "argoproj.io",
  resources: [
    // { kind: "Application" },  // Commented out - using custom component
    { kind: "AppProject", displayName: "Projects" },
    { kind: "ApplicationSet", displayName: "ApplicationSets" },
  ],
};
```

Then create the Application API, Store, Routes, and UI manually for full control.

#### Example: Adding Status Icons

For resources with status indicators:

```typescript
renderTableContents={item => {
  const status = item.status?.phase || "Unknown";
  const isReady = item.status?.conditions?.some(c => 
    c.type === "Ready" && c.status === "True"
  );
  
  return [
    <>
      <KubeObjectStatusIcon 
        key="icon" 
        object={item}
        status={isReady ? "success" : "warning"}
      />
      {item.getName()}
    </>,
    <NamespaceSelectBadge key="namespace" namespace={item.getNs() || ""} />,
    <span key="status" className={`status-${status.toLowerCase()}`}>
      {status}
    </span>,
    <KubeObjectAge key="age" object={item} />,
  ];
}}
```

### Custom Resource Methods

For resources that need custom API methods (beyond CRUD operations), create a dedicated API class extending `KubeObject`.

#### Example: ArgoCD Application API with Custom Methods

**1. Create Custom KubeObject Class** (`argocd-application.api.ts`):

```typescript
import { KubeObject } from "@k8slens/kube-object";
import type { KubeObjectMetadata, KubeObjectScope } from "@k8slens/kube-object";

export interface ArgoCDApplicationSpec {
  source: {
    repoURL: string;
    path?: string;
    targetRevision?: string;
    chart?: string;
  };
  destination: {
    server: string;
    namespace: string;
  };
  project: string;
  syncPolicy?: {
    automated?: {
      prune?: boolean;
      selfHeal?: boolean;
    };
  };
}

export interface ArgoCDApplicationStatus {
  sync?: {
    status: "Synced" | "OutOfSync" | "Unknown";
    revision?: string;
  };
  health?: {
    status: "Healthy" | "Progressing" | "Degraded" | "Suspended" | "Missing" | "Unknown";
  };
  operationState?: {
    phase: "Running" | "Failed" | "Error" | "Succeeded";
    startedAt?: string;
    finishedAt?: string;
  };
  resources?: Array<{
    kind: string;
    name: string;
    namespace?: string;
    status?: string;
  }>;
}

export class ArgoCDApplication extends KubeObject<
  KubeObjectMetadata<KubeObjectScope.Namespace>,
  ArgoCDApplicationStatus,
  ArgoCDApplicationSpec
> {
  static readonly kind = "Application";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/argoproj.io/v1alpha1/applications";

  /**
   * Get the Git repository URL
   */
  getRepoUrl(): string {
    return this.spec?.source?.repoURL || "";
  }

  /**
   * Get the target revision (branch/tag/commit)
   */
  getTargetRevision(): string {
    return this.spec?.source?.targetRevision || "HEAD";
  }

  /**
   * Get the application path in the repository
   */
  getPath(): string {
    return this.spec?.source?.path || "";
  }

  /**
   * Get the destination cluster server URL
   */
  getDestinationServer(): string {
    return this.spec?.destination?.server || "";
  }

  /**
   * Get the destination namespace
   */
  getDestinationNamespace(): string {
    return this.spec?.destination?.namespace || "";
  }

  /**
   * Get the ArgoCD project name
   */
  getProject(): string {
    return this.spec?.project || "default";
  }

  /**
   * Get sync status
   */
  getSyncStatus(): string {
    return this.status?.sync?.status || "Unknown";
  }

  /**
   * Check if application is synced
   */
  isSynced(): boolean {
    return this.getSyncStatus() === "Synced";
  }

  /**
   * Get health status
   */
  getHealthStatus(): string {
    return this.status?.health?.status || "Unknown";
  }

  /**
   * Check if application is healthy
   */
  isHealthy(): boolean {
    return this.getHealthStatus() === "Healthy";
  }

  /**
   * Check if auto-sync is enabled
   */
  hasAutoSync(): boolean {
    return !!this.spec?.syncPolicy?.automated;
  }

  /**
   * Check if auto-prune is enabled
   */
  hasAutoPrune(): boolean {
    return !!this.spec?.syncPolicy?.automated?.prune;
  }

  /**
   * Check if self-heal is enabled
   */
  hasSelfHeal(): boolean {
    return !!this.spec?.syncPolicy?.automated?.selfHeal;
  }

  /**
   * Get current operation phase
   */
  getOperationPhase(): string | undefined {
    return this.status?.operationState?.phase;
  }

  /**
   * Check if operation is in progress
   */
  isOperationInProgress(): boolean {
    const phase = this.getOperationPhase();
    return phase === "Running";
  }

  /**
   * Get managed resources count
   */
  getResourcesCount(): number {
    return this.status?.resources?.length || 0;
  }
}
```

**2. Create Custom API Class** (`argocd-application.api.injectable.ts`):

```typescript
import { getInjectable } from "@ogre-tools/injectable";
import { KubeApi } from "../../kube-api";
import { ArgoCDApplication } from "./argocd-application.api";
import maybeKubeApiInjectable from "../../maybe-kube-api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { kubeApiInjectionToken } from "../../kube-api/kube-api-injection-token";
import type { NamespacedResourceDescriptor } from "../../kube-api";

export class ArgoCDApplicationApi extends KubeApi<ArgoCDApplication> {
  constructor(deps, opts?) {
    super(deps, {
      ...opts,
      objectConstructor: ArgoCDApplication,
    });
  }

  /**
   * Sync an application manually
   */
  async sync(params: NamespacedResourceDescriptor, options?: {
    prune?: boolean;
    dryRun?: boolean;
    resources?: string[];
  }) {
    const url = this.getUrl(params);
    
    return this.request.post(`${url}/sync`, {
      data: {
        prune: options?.prune,
        dryRun: options?.dryRun,
        resources: options?.resources,
      },
    });
  }

  /**
   * Refresh application data from Git
   */
  async refresh(params: NamespacedResourceDescriptor, hard = false) {
    const url = this.getUrl(params);
    
    return this.request.post(`${url}/refresh`, {
      query: { refresh: hard ? "hard" : "normal" },
    });
  }

  /**
   * Rollback to a specific revision
   */
  async rollback(params: NamespacedResourceDescriptor, revision: string) {
    const url = this.getUrl(params);
    
    return this.request.post(`${url}/rollback`, {
      data: { revision },
    });
  }
}

const argoCDApplicationApiInjectable = getInjectable({
  id: "argocd-application-api",
  instantiate: (di) => new ArgoCDApplicationApi({
    logger: di.inject(loggerInjectionToken),
    maybeKubeApi: di.inject(maybeKubeApiInjectable),
  }),
  injectionToken: kubeApiInjectionToken,
});

export default argoCDApplicationApiInjectable;
```

**3. Use Custom Methods in UI**:

```typescript
// In your component
const handleSync = async (app: ArgoCDApplication) => {
  try {
    await argoCDApplicationApi.sync({
      name: app.getName(),
      namespace: app.getNs(),
    }, {
      prune: true,
    });
    
    notifications.ok(`Synced ${app.getName()}`);
  } catch (error) {
    notifications.error(`Failed to sync: ${error}`);
  }
};

// Display custom data
{applications.map(app => (
  <div key={app.getId()}>
    <h3>{app.getName()}</h3>
    <p>Repository: {app.getRepoUrl()}</p>
    <p>Branch: {app.getTargetRevision()}</p>
    <p>Status: {app.getSyncStatus()} / {app.getHealthStatus()}</p>
    <p>Auto-sync: {app.hasAutoSync() ? "Enabled" : "Disabled"}</p>
    <button onClick={() => handleSync(app)}>Sync</button>
  </div>
))}
```

### Mixing Dynamic and Custom Resources

You can use the dynamic system for simple resources and custom implementations for complex ones in the same group:

```typescript
// Config - only simple resources
export const argoCDResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "argocd",
  displayName: "ArgoCD",
  icon: "argoCD",
  orderNumber: 91,
  apiGroup: "argoproj.io",
  resources: [
    // Application - custom (not in config)
    { kind: "AppProject", displayName: "Projects" },      // Dynamic
    { kind: "ApplicationSet", displayName: "ApplicationSets" },  // Dynamic
  ],
};

// Then create Application manually with custom API, Store, Routes, UI
```

This gives you the best of both worlds: quick setup for simple resources, full control for complex ones.

### Adding Custom Styles

Create SCSS files for custom styling:

```scss
// argocd-applications.scss
.ArgoCDApplications {
  .sync-status-synced {
    color: var(--success-color);
    font-weight: 600;
  }

  .sync-status-outofsync {
    color: var(--warning-color);
    font-weight: 600;
  }

  .health-status-healthy {
    color: var(--success-color);
  }

  .health-status-degraded {
    color: var(--error-color);
  }

  .health-status-progressing {
    color: var(--primary-color);
  }
}
```

Import in your component:
```typescript
import "./argocd-applications.scss";
```

## Troubleshooting

### Resource not showing up

1. **Check CRD is installed**: `kubectl get crds | grep {apiGroup}`
2. **Check API group matches**: Ensure `apiGroup` in config matches CRD's group
3. **Check resource kind matches**: Ensure `kind` matches CRD's spec.names.kind
4. **Check browser console**: Look for warnings like "CRD not found for..."

### Icon not appearing

1. **Check SVG file exists**: Verify file is in `renderer/components/icon/`
2. **Check icon is imported**: Look for import statement in `icon.tsx`
3. **Check icon is in Map**: Verify `["iconName", IconVariable]` in `localSvgIcons`
4. **Check icon is in type**: Verify `| "iconName"` in `NamedSvg` type union
5. **Rebuild**: Run `npm run build` after adding icon

### Wrong metadata detected

If plural name or other metadata is incorrect:
- Verify the CRD definition: `kubectl get crd {name} -o yaml`
- Check `spec.names.plural`, `spec.group`, `spec.versions[].name`

## Benefits

✅ **Ultra-minimal code** - 3-5 lines per resource vs 420+ lines
✅ **Auto-discovery** - Metadata extracted from CRDs
✅ **Reactive** - Updates when CRDs change
✅ **No hardcoding** - Works with any CRD version
✅ **Type-safe** - Full TypeScript support
✅ **Zero maintenance** - CRD updates don't require code changes

## Quick Reference: Icon Setup Checklist

For every new resource group, you need an icon. Here's the complete checklist:

### ✅ ArgoCD (Already Done)
- [x] SVG file: `renderer/components/icon/argocd.svg`
- [x] Import: `import ArgoCD from "./argocd.svg";`
- [x] Map entry: `["argoCD", ArgoCD]`
- [x] Type entry: `| "argoCD"`
- [x] Used in config: `icon: "argoCD"`

### 📋 Template for New Icons

**1. Create SVG file:** `renderer/components/icon/{name}.svg`
```xml
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Your icon paths here -->
</svg>
```

**2. Import in `icon.tsx`** (around line 14):
```typescript
import YourIcon from "./{name}.svg";
```

**3. Add to Map** (around line 53):
```typescript
["yourIcon", YourIcon],
```

**4. Add to Type** (around line 79):
```typescript
| "yourIcon"
```

**5. Use in config:**
```typescript
icon: "yourIcon"
```

### 🎨 Icon Design Guidelines

- **Format:** SVG (vector format)
- **ViewBox:** `0 0 256 256` (recommended)
- **Colors:** Use `fill` attribute (can be themed by CSS)
- **Size:** Automatically scaled by Lens
- **Style:** Simple, clear, recognizable at small sizes

### 🔍 Finding Icons

Sources for project logos:
- **Official repos:** Look for SVG logos in project documentation
- **Simple Icons:** https://simpleicons.org/
- **SVG Repo:** https://www.svgrepo.com/
- **Project websites:** Usually have logo downloads

### Example: Adding VPA Icon

```bash
# 1. Create the SVG
cat > packages/core/src/renderer/components/icon/vpa.svg << 'EOF'
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M128 16l-96 55.5v111L128 238l96-55.5v-111z"/>
</svg>
EOF

# 2. Edit icon.tsx - add import
# import VPA from "./vpa.svg";

# 3. Edit icon.tsx - add to Map
# ["vpa", VPA],

# 4. Edit icon.tsx - add to Type
# | "vpa"

# 5. Build
npm run build
```

Done! 🎉

## Architecture

### Key Files

- **`common/managed-resources/managed-resource-group.ts`** - Type definitions
- **`common/managed-resources/managed-resource-groups.injectable.ts`** - Central registry
- **`common/managed-resources/argocd-resource-group.config.ts`** - Example config
- **`common/managed-resources/factories/`** - Factory functions for generating injectables
- **`renderer/components/managed-resources/`** - Generic UI components
- **`renderer/before-frame-starts/runnables/setup-managed-resource-groups.injectable.ts`** - Orchestrator

### Data Flow

```
Config → Orchestrator → Factories → Injectables → Lens DI System → UI
```

## Adding a New Resource Group

### Step 1: Create Configuration File

Create a new file in `common/managed-resources/`:

```typescript
// vpa-resource-group.config.ts
import type { ManagedResourceGroupConfig } from "./managed-resource-group";

export const vpaResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "vpa",  // Unique ID for the group
  displayName: "VPA",  // Display name in sidebar
  icon: "vpa",  // Icon name (must be registered in icon.tsx)
  orderNumber: 92,  // Sidebar position (higher = lower in list)
  resources: [
    {
      kind: "VerticalPodAutoscaler",
      apiVersion: "autoscaling.k8s.io/v1",
      group: "autoscaling.k8s.io",
      pluralName: "verticalpodautoscalers",
      namespaced: true,
      displayName: "Vertical Pod Autoscalers",
    },
    {
      kind: "VerticalPodAutoscalerCheckpoint",
      apiVersion: "autoscaling.k8s.io/v1",
      group: "autoscaling.k8s.io",
      pluralName: "verticalpodautoscalercheckpoints",
      namespaced: true,
      displayName: "VPA Checkpoints",
    },
  ],
};
```

### Step 2: Add Icon (if needed)

If your group needs a custom icon:

1. Add SVG file to `renderer/components/icon/`
2. Register in `renderer/components/icon/icon.tsx`:

```typescript
import VPA from "./vpa.svg";

// In localSvgIcons Map:
["vpa", VPA],

// In NamedSvg type:
| "vpa"
```

### Step 3: Register Configuration

Add your config to `common/managed-resources/managed-resource-groups.injectable.ts`:

```typescript
import { vpaResourceGroupConfig } from "./vpa-resource-group.config";

const managedResourceGroupsInjectable = getInjectable({
  id: "managed-resource-groups",
  instantiate: (): ManagedResourceGroupConfig[] => [
    argoCDResourceGroupConfig,
    vpaResourceGroupConfig,  // Add here
    // Add more...
  ],
  lifecycle: lifecycleEnum.singleton,
});
```

### Step 4: Build and Test

```bash
npm run build
npm run dev
```

That's it! Your new resource group will appear in the sidebar with all functionality automatically wired up.

## Configuration Reference

### ManagedResourceGroupConfig

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (kebab-case recommended) |
| `displayName` | string | Name shown in sidebar |
| `icon` | string | Icon identifier from icon.tsx |
| `orderNumber` | number | Sidebar position (90-99 recommended) |
| `resources` | ManagedResourceConfig[] | Array of CRDs in this group |

### ManagedResourceConfig

| Field | Type | Description |
|-------|------|-------------|
| `kind` | string | Kubernetes resource kind (e.g., "Application") |
| `apiVersion` | string | Full API version (e.g., "argoproj.io/v1alpha1") |
| `group` | string | API group (e.g., "argoproj.io") |
| `pluralName` | string | Plural resource name for API (e.g., "applications") |
| namespaced` | boolean | Whether resource is namespaced |
| `displayName` | string | Display name in UI (e.g., "Applications") |

## Generated Routes

Resources are automatically accessible at:

```
/cluster/{groupId}/{pluralName}
```

Examples:
- `/argocd/applications`
- `/argocd/appprojects`
- `/argocd/applicationsets`
- `/vpa/verticalpodautoscalers`

## Customization

### Custom UI Columns

The default UI shows Name, Namespace, and Age columns. To customize:

1. Create a custom component similar to `ManagedResourceList`
2. Modify the factory to use your custom component
3. Or extend `ManagedResourceConfig` to include column definitions

### Custom Resource Methods

The dynamic system creates basic `KubeObject` subclasses. For custom methods (like ArgoCD's `getSource()`, `getSyncStatus()`), create a dedicated API file:

```typescript
// argocd-application.api.ts
export class ArgoCDApplication extends KubeObject {
  static readonly kind = "Application";
  static readonly apiBase = "/apis/argoproj.io/v1alpha1/applications";
  
  getSource() {
    return this.spec?.source;
  }
  
  getSyncStatus() {
    return this.status?.sync?.status;
  }
}
```

Then modify the factory or create a specific injectable for that resource.

## Examples

### ArgoCD (Current Implementation)

File: `common/managed-resources/argocd-resource-group.config.ts`

```typescript
export const argoCDResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "argocd",
  displayName: "ArgoCD",
  icon: "argoCD",
  orderNumber: 91,
  resources: [
    {
      kind: "Application",
      apiVersion: "argoproj.io/v1alpha1",
      group: "argoproj.io",
      pluralName: "applications",
      namespaced: true,
      displayName: "Applications",
    },
    {
      kind: "AppProject",
      apiVersion: "argoproj.io/v1alpha1",
      group: "argoproj.io",
      pluralName: "appprojects",
      namespaced: true,
      displayName: "Projects",
    },
    {
      kind: "ApplicationSet",
      apiVersion: "argoproj.io/v1alpha1",
      group: "argoproj.io",
      pluralName: "applicationsets",
      namespaced: true,
      displayName: "ApplicationSets",
    },
  ],
};
```

## Implementation Details

### Display Names with Section Prefix

Resource display names automatically include the group's display name as a prefix:

```typescript
// In the UI, you'll see:
"ArgoCD Applications"  // not just "Applications"
"ArgoCD Projects"      // not just "Projects"
"ArgoCD ApplicationSets" // not just "ApplicationSets"
```

This is handled automatically in `create-managed-resource-route-component.injectable.tsx`:
```typescript
displayName={`${groupDisplayName} ${resource.displayName || resource.kind}`}
```

### Filtering from Custom Resources Section

Managed resources are **automatically filtered out** of the "Custom Resources" section to avoid duplication.

**How it works:**
- The system builds a set of all managed resources (group + kind)
- The Custom Resources section filters out any CRDs that match
- Result: ArgoCD resources **only** appear in the "ArgoCD" section

**Implementation:** In `sidebar-items-for-definition-groups.injectable.ts`:
```typescript
// Build set of managed resources
const managedResources = new Set<string>();
managedResourceGroups.forEach(group => {
  group.resources.forEach(resource => {
    managedResources.add(`${group.apiGroup}/${resource.kind}`);
  });
});

// Filter out managed CRDs
const unmanagedDefinitions = definitions.filter(crd => 
  !managedResources.has(`${crd.getGroup()}/${crd.getResourceKind()}`)
);
```

### Layout Consistency

All managed resources use `<SiblingsInTabLayout>` wrapper to ensure consistent behavior with built-in resources:

```typescript
return (
  <SiblingsInTabLayout>
    <ManagedResourceList
      store={store}
      resourceName={resource.pluralName}
      displayName={displayName}
    />
  </SiblingsInTabLayout>
);
```

This ensures:
- Consistent spacing and padding
- Same navigation behavior
- Uniform appearance across all resources

## Troubleshooting

### Resource not showing up

1. Check the CRD is installed in your cluster: `kubectl get crds`
2. Verify API group and version match the CRD
3. Check browser console for errors
4. Ensure icon is registered if using custom icon

### TypeScript errors

- Ensure all fields in config match the interfaces
- Check that icon name exists in icon.tsx
- Verify apiVersion format: `{group}/{version}`

### Build errors

- Run `npm run build` to see compilation errors
- Check import paths in your config file
- Ensure config is added to `managed-resource-groups.injectable.ts`

## Benefits

✅ **Minimal code** - Add 10-50 lines vs 500+ lines per resource  
✅ **Consistency** - All resources use same UI patterns  
✅ **Maintainability** - Change behavior in one place  
✅ **Type-safe** - TypeScript interfaces prevent errors  
✅ **Extensible** - Easy to add custom behavior when needed  
✅ **Flexible** - Supports both dynamic CRD detection and static fallback
