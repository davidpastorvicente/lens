/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ManagedResourceGroupConfig } from "./managed-resource-group";

/**
 * OpenShift resource group configuration
 * Provides static metadata as fallback, but will use CRD auto-detection if available
 */
export const openShiftResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "openshift",
  displayName: "OpenShift",
  icon: "openShift",
  orderNumber: 92,
  apiGroup: "route.openshift.io",
  resources: [
    {
      kind: "Route",
      displayName: "Routes",
      apiVersion: "v1",
      pluralName: "routes",
      namespaced: true,
    },
  ],
};
