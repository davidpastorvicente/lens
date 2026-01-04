/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import managedResourceGroupsInjectable from "../../../common/managed-resources/managed-resource-groups.injectable";
import { injectableDifferencingRegistratorWith } from "../../../common/utils/registrator-helper";
import { createManagedResourceApiInjectable } from "../../../common/managed-resources/factories/create-managed-resource-api.injectable";
import { createManagedResourceStoreInjectable } from "../../../common/managed-resources/factories/create-managed-resource-store.injectable";
import { createManagedResourceRouteInjectable } from "../../../common/managed-resources/factories/create-managed-resource-route.injectable";
import { createManagedResourceNavigationInjectable } from "../../../common/managed-resources/factories/create-managed-resource-navigation.injectable";
import { createManagedResourceRouteComponentInjectable } from "../../components/managed-resources/create-managed-resource-route-component.injectable";
import { createManagedResourceGroupSidebarItemsInjectable } from "../../components/managed-resources/create-managed-resource-group-sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import customResourceDefinitionStoreInjectable from "../../components/custom-resources/definition.store.injectable";
import type { EnrichedResourceConfig } from "../../../common/managed-resources/managed-resource-group";

/**
 * Sets up dynamic registration of managed resource groups
 * Watches the managed resource groups configuration and automatically generates:
 * - API endpoints
 * - Stores
 * - Routes
 * - Navigation functions
 * - UI components
 * - Sidebar items
 * 
 * Also enriches resource configs by fetching metadata from CRDs
 */
const setupManagedResourceGroupsInjectable = getInjectable({
  id: "setup-managed-resource-groups",
  instantiate: (di) => ({
    run: () => {
      const managedResourceGroups = di.inject(managedResourceGroupsInjectable);
      const injectableDifferencingRegistrator = injectableDifferencingRegistratorWith(di);
      const crdStore = di.inject(customResourceDefinitionStoreInjectable);

      // Generate injectables for all managed resource groups
      const generateInjectables = () => {
        console.log("[Managed Resources] Generating injectables...");
        console.log("[Managed Resources] Groups:", managedResourceGroups.map(g => g.id));
        console.log("[Managed Resources] CRD Store has", crdStore.items.length, "items");
        
        const injectables = [];

        for (const group of managedResourceGroups) {
          const routeInjectables: any[] = [];
          const navigationInjectables: any[] = [];
          const enrichedResources: EnrichedResourceConfig[] = [];

          // Enrich resources with CRD metadata (or use static config)
          for (const resource of group.resources) {
            let enriched: EnrichedResourceConfig;

            // Check if resource already has static metadata
            if (resource.apiVersion && resource.pluralName && resource.namespaced !== undefined) {
              // Use static configuration
              // Derive full apiVersion and group from parent config
              const version = resource.apiVersion;
              const fullApiVersion = group.apiGroup ? `${group.apiGroup}/${version}` : version;
              
              console.log(`[Managed Resources] Using static config for ${group.apiGroup}/${resource.kind}`);
              enriched = {
                kind: resource.kind,
                displayName: resource.displayName || resource.kind,
                apiVersion: fullApiVersion,
                group: group.apiGroup,
                pluralName: resource.pluralName,
                namespaced: resource.namespaced,
                columns: resource.columns || [],
              };
            } else {
              // Try to find CRD for this resource
              const crd = crdStore.items.find(
                crd => crd.getResourceKind() === resource.kind && crd.getGroup() === group.apiGroup,
              );

              if (!crd) {
                // CRD not found and no static config, skip this resource
                console.warn(`[Managed Resources] CRD not found for ${group.apiGroup}/${resource.kind} and no static config provided`);
                console.log(`[Managed Resources] Available CRDs:`, crdStore.items.map(c => `${c.getGroup()}/${c.getResourceKind()}`));
                continue;
              }

              console.log(`[Managed Resources] Found CRD for ${group.apiGroup}/${resource.kind}:`, crd.getPluralName());

              // Enrich resource config with CRD metadata
              enriched = {
                kind: resource.kind,
                displayName: resource.displayName || resource.kind,
                apiVersion: `${crd.getGroup()}/${crd.getVersion()}`,
                group: crd.getGroup(),
                pluralName: crd.getPluralName(),
                namespaced: crd.isNamespaced(),
                columns: resource.columns || [],
              };
            }

            enrichedResources.push(enriched);
          }

          // Generate injectables for each enriched resource
          for (const resource of enrichedResources) {
            // 1. Create API injectable
            const apiInjectable = createManagedResourceApiInjectable(group.id, resource);

            injectables.push(apiInjectable);

            // 2. Create Store injectable
            const storeInjectable = createManagedResourceStoreInjectable(
              group.id,
              resource,
              apiInjectable,
            );

            injectables.push(storeInjectable);

            // 3. Create Route injectable
            const routeInjectable = createManagedResourceRouteInjectable(group.id, resource);

            injectables.push(routeInjectable);
            routeInjectables.push(routeInjectable);

            // 4. Create Navigation injectable
            const navigationInjectable = createManagedResourceNavigationInjectable(
              group.id,
              resource,
              routeInjectable,
            );

            injectables.push(navigationInjectable);
            navigationInjectables.push(navigationInjectable);

            // 5. Create Route Component injectable
            const routeComponentInjectable = createManagedResourceRouteComponentInjectable(
              group.id,
              group.displayName,
              resource,
              routeInjectable,
              storeInjectable,
            );

            injectables.push(routeComponentInjectable);
          }

          // 6. Only create Sidebar Items if we have enriched resources
          // No point showing an empty sidebar group
          if (enrichedResources.length > 0) {
            const sidebarItemsInjectable = createManagedResourceGroupSidebarItemsInjectable(
              group,
              enrichedResources,
              navigationInjectables,
              routeInjectables,
              routeIsActiveInjectable,
            );

            injectables.push(sidebarItemsInjectable);
          } else {
            console.warn(`[Managed Resources] No enriched resources for group ${group.id}, skipping sidebar`);
          }
        }

        return injectables;
      };

      // Register injectables reactively (re-register if config or CRDs change)
      reaction(
        () => [managedResourceGroups, crdStore.items] as const,
        () => {
          const injectables = generateInjectables();

          injectableDifferencingRegistrator(injectables);
        },
        {
          fireImmediately: true,
        },
      );
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default setupManagedResourceGroupsInjectable;
