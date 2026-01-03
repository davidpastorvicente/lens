/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { KubeApi } from "../../k8s-api/kube-api";
import { KubeObject } from "@k8slens/kube-object";
import type { EnrichedResourceConfig } from "../managed-resource-group";
import maybeKubeApiInjectable from "../../k8s-api/maybe-kube-api.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { kubeApiInjectionToken } from "../../k8s-api/kube-api/kube-api-injection-token";

/**
 * Factory function to create a KubeApi injectable for a managed resource
 */
export const createManagedResourceApiInjectable = (
  groupId: string,
  resource: EnrichedResourceConfig,
) => {
  // Construct proper apiBase path
  // For core resources (no group): /api/{version}/{resource}
  // For custom resources: /apis/{group}/{version}/{resource}
  const apiPrefix = resource.group ? '/apis' : '/api';
  const groupPath = resource.group ? `/${resource.group}` : '';
  const apiBase = `${apiPrefix}${groupPath}/${resource.apiVersion.split('/').pop()}/${resource.pluralName}`;
  
  const injectableId = `${groupId}-${resource.pluralName}-api`;

  return getInjectable({
    id: injectableId,
    instantiate: (di) => {
      // Create a dynamic KubeObject class with the resource metadata
      const objectConstructor = class extends KubeObject {
        static readonly kind = resource.kind;
        static readonly namespaced = resource.namespaced;
        static readonly apiBase = apiBase;
      };

      return new KubeApi(
        {
          logger: di.inject(loggerInjectionToken),
          maybeKubeApi: di.inject(maybeKubeApiInjectable),
        },
        { objectConstructor },
      );
    },
    injectionToken: kubeApiInjectionToken,
  });
};
