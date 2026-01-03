/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { EnrichedResourceConfig } from "../managed-resource-group";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import type { Route } from "../../front-end-routing/front-end-route-injection-token";

/**
 * Factory function to create a navigation function injectable for a managed resource
 */
export const createManagedResourceNavigationInjectable = (
  groupId: string,
  resource: EnrichedResourceConfig,
  routeInjectable: any,
) => {
  const injectableId = `navigate-to-${groupId}-${resource.pluralName}`;

  return getInjectable({
    id: injectableId,
    instantiate: (di) => {
      const navigateToRoute = di.inject(navigateToRouteInjectionToken);
      const route = di.inject(routeInjectable) as Route<unknown>;

      return () => navigateToRoute(route);
    },
  });
};
