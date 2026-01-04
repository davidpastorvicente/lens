/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ManagedResourceGroupConfig } from "./managed-resource-group";

/**
 * ArgoCD resource group configuration
 * Provides static metadata as fallback, but will use CRD auto-detection if available
 */
export const argoCDResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "argocd",
  displayName: "ArgoCD",
  icon: "argoCD",
  orderNumber: 91,
  apiGroup: "argoproj.io",
  resources: [
    {
      kind: "Application",
      displayName: "Applications",
      apiVersion: "v1alpha1",
      pluralName: "applications",
      namespaced: true,
      columns: [
        {
          id: "destination",
          title: "Destination",
          getValue: (item) => {
            return (item as any).spec?.destination?.namespace || "-";
          },
        },
        {
          id: "sync-status",
          title: "Sync",
          getValue: (item) => {
            return (item as any).status?.sync?.status || "Unknown";
          },
        },
        {
          id: "health-status",
          title: "Health",
          getValue: (item) => {
            return (item as any).status?.health?.status || "Unknown";
          },
        },
      ],
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
