/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { EnrichedResourceConfig } from "../managed-resource-group";
import createCustomResourceStoreInjectable from "../../k8s-api/api-manager/create-custom-resource-store.injectable";
import { kubeObjectStoreInjectionToken } from "../../k8s-api/api-manager/kube-object-store-token";
import type { KubeApi } from "../../k8s-api/kube-api";
import type { KubeObject } from "@k8slens/kube-object";

/**
 * Factory function to create a store injectable for a managed resource
 */
export const createManagedResourceStoreInjectable = (
  groupId: string,
  resource: EnrichedResourceConfig,
  apiInjectable: any,
) => {
  const injectableId = `${groupId}-${resource.pluralName}-store`;

  return getInjectable({
    id: injectableId,
    instantiate: (di) => {
      const api = di.inject(apiInjectable) as KubeApi<KubeObject>;
      const createStore = di.inject(createCustomResourceStoreInjectable);

      return createStore(api);
    },
    injectionToken: kubeObjectStoreInjectionToken,
  });
};
