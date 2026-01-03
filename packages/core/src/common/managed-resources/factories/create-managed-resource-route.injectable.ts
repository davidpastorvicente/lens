/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { EnrichedResourceConfig } from "../managed-resource-group";
import { frontEndRouteInjectionToken } from "../../front-end-routing/front-end-route-injection-token";

/**
 * Factory function to create a route injectable for a managed resource
 */
export const createManagedResourceRouteInjectable = (
  groupId: string,
  resource: EnrichedResourceConfig,
) => {
  const injectableId = `${groupId}-${resource.pluralName}-route`;
  const path = `/${groupId}/${resource.pluralName}`;

  return getInjectable({
    id: injectableId,
    instantiate: () => ({
      path,
      clusterFrame: true,
      isEnabled: computed(() => true),
    }),
    injectionToken: frontEndRouteInjectionToken,
  });
};
