/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ManagedResourceGroupConfig } from "./managed-resource-group";

/**
 * Cert-Manager resource group configuration
 * Provides static metadata as fallback, but will use CRD auto-detection if available
 */
export const certManagerResourceGroupConfig: ManagedResourceGroupConfig = {
  id: "certmanager",
  displayName: "Cert-Manager",
  icon: "certManager",
  orderNumber: 92,
  apiGroup: "cert-manager.io",
  resources: [
    {
      kind: "Certificate",
      displayName: "Certificates",
      apiVersion: "v1",
      pluralName: "certificates",
      namespaced: true,
    },
    {
      kind: "CertificateRequest",
      displayName: "Certificate Requests",
      apiVersion: "v1",
      pluralName: "certificaterequests",
      namespaced: true,
    },
    {
      kind: "Issuer",
      displayName: "Issuers",
      apiVersion: "v1",
      pluralName: "issuers",
      namespaced: true,
    },
    {
      kind: "ClusterIssuer",
      displayName: "Cluster Issuers",
      apiVersion: "v1",
      pluralName: "clusterissuers",
      namespaced: false,
    },
  ],
};
