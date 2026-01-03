/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

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
}
