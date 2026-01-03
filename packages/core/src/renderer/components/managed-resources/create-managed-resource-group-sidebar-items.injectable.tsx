/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed, type IComputedValue } from "mobx";
import type { ManagedResourceGroupConfig, EnrichedResourceConfig } from "../../../common/managed-resources/managed-resource-group";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import React from "react";
import { noop } from "lodash/fp";
import type { Route } from "../../../common/front-end-routing/front-end-route-injection-token";

/**
 * Factory function to create sidebar items for a managed resource group
 * Creates parent item + child items for each resource
 */
export const createManagedResourceGroupSidebarItemsInjectable = (
  config: ManagedResourceGroupConfig,
  enrichedResources: EnrichedResourceConfig[],
  navigationInjectables: any[],
  routeInjectables: any[],
  routeIsActiveInjectable: any,
) => {
  const injectableId = `${config.id}-sidebar-items`;
  const parentId = `managed-resource-group-${config.id}`;

  return getInjectable({
    id: injectableId,
    instantiate: (di) => {
      // Return a computed that lazily injects routes/navigations when accessed
      return computed(() => {
        // Inject routes and navigations lazily inside the computed
        // This ensures they're available when the sidebar is rendered
        const routes = routeInjectables.map(inj => {
          try {
            return di.inject(inj) as Route<unknown>;
          } catch (e) {
            console.warn(`Failed to inject route for ${config.id}:`, e);
            return null;
          }
        });
        const navigations = navigationInjectables.map(inj => {
          try {
            return di.inject(inj) as () => void;
          } catch (e) {
            console.warn(`Failed to inject navigation for ${config.id}:`, e);
            return noop;
          }
        });

        // Filter out items where route/navigation failed to inject
        const childItems = enrichedResources
          .map((resource, index) => {
            const route = routes[index];
            const navigation = navigations[index];
            
            if (!route || !navigation) {
              console.warn(`Skipping sidebar item for ${resource.kind} - route or navigation not available`);
              return null;
            }

            // Inject routeIsActive for THIS specific route
            const routeIsActive = di.inject(routeIsActiveInjectable, route) as IComputedValue<boolean>;

            return {
              id: `${parentId}-${resource.pluralName}`,
              parentId,
              title: resource.displayName || resource.kind,
              onClick: navigation,
              isActive: routeIsActive,
              isVisible: route.isEnabled || computed(() => true),
              orderNumber: (index + 1) * 10,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        return [
          {
            id: parentId,
            parentId: null,
            title: config.displayName,
            onClick: noop,
            getIcon: () => <Icon svg={config.icon} />,
            isVisible: computed(() => true), // Always visible
            orderNumber: config.orderNumber,
          },
          ...childItems,
        ];
      });
    },
    injectionToken: sidebarItemsInjectionToken,
  });
};
