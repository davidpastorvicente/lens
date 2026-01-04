/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type React from "react";
import type { KubeObject } from "@k8slens/kube-object";

/**
 * Custom column definition for managed resources
 */
export interface ManagedResourceColumn {
  id: string;                                    // Unique column ID (used for className and sortBy)
  title: string;                                 // Column header title
  getValue: (item: KubeObject) => React.ReactNode;  // Function to extract/render cell value
}

/**
 * Simplified configuration for a managed resource
 * Metadata will be auto-detected from CRD if not provided
 */
export interface ManagedResourceConfig {
  kind: string;  // e.g., "Application"
  displayName?: string;  // Optional override, defaults to kind
  // Optional: provide static metadata to avoid CRD dependency
  apiVersion?: string;
  group?: string;
  pluralName?: string;
  namespaced?: boolean;
  // Optional: custom columns (beyond default: Name, Namespace, Age)
  columns?: ManagedResourceColumn[];
}

/**
 * Configuration for a group of related managed resources
 */
export interface ManagedResourceGroupConfig {
  id: string;
  displayName: string;
  icon: string;
  orderNumber: number;
  apiGroup: string;  // e.g., "argoproj.io" - used to find CRDs
  resources: ManagedResourceConfig[];
}

/**
 * Enriched resource config with CRD metadata
 * Used internally by factories after CRD detection or static config
 */
export interface EnrichedResourceConfig extends Required<ManagedResourceConfig> {
  displayName: string;
  columns: ManagedResourceColumn[];
}
