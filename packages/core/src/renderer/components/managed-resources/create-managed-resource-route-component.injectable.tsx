/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { EnrichedResourceConfig } from "../../../common/managed-resources/managed-resource-group";
import React from "react";
import { ManagedResourceList } from "./managed-resource-list";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import type { Route } from "../../../common/front-end-routing/front-end-route-injection-token";
import type { CustomResourceStore } from "../../../common/k8s-api/api-manager/resource.store";
import type { KubeObject } from "@k8slens/kube-object";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";

/**
 * Factory function to create a route component injectable for a managed resource
 */
export const createManagedResourceRouteComponentInjectable = (
  groupId: string,
  groupDisplayName: string,
  resource: EnrichedResourceConfig,
  routeInjectable: any,
  storeInjectable: any,
) => {
  const injectableId = `${groupId}-${resource.pluralName}-route-component`;

  return getInjectable({
    id: injectableId,
    instantiate: (di) => ({
      route: di.inject(routeInjectable) as Route<unknown>,
      Component: () => {
        const store = di.inject(storeInjectable) as CustomResourceStore<KubeObject>;

        return (
          <SiblingsInTabLayout>
            <ManagedResourceList
              store={store}
              resourceName={resource.pluralName}
              displayName={`${groupDisplayName} ${resource.displayName || resource.kind}`}
              customColumns={resource.columns}
            />
          </SiblingsInTabLayout>
        );
      },
    }),
    injectionToken: routeSpecificComponentInjectionToken,
  });
};
