/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { KubeObject } from "@k8slens/kube-object";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import type { CustomResourceStore } from "../../../common/k8s-api/api-manager/resource.store";
import type { ManagedResourceColumn } from "../../../common/managed-resources/managed-resource-group";

export interface ManagedResourceListProps {
  store: CustomResourceStore<KubeObject>;
  resourceName: string;
  displayName: string;
  customColumns?: ManagedResourceColumn[];
}

/**
 * Generic list component for managed resources
 * Renders a table with Name, Namespace, custom columns (if any), and Age
 */
export const ManagedResourceList = ({ store, resourceName, displayName, customColumns = [] }: ManagedResourceListProps) => {
  // Build column IDs for sorting
  const columnIds = {
    name: "name",
    namespace: "namespace",
    age: "age",
    ...Object.fromEntries(customColumns.map(col => [col.id, col.id])),
  };

  // Build sorting callbacks
  const sortingCallbacks: Record<string, (item: KubeObject) => any> = {
    [columnIds.name]: item => item.getName(),
    [columnIds.namespace]: item => item.getNs(),
    [columnIds.age]: item => -item.getCreationTimestamp(),
  };

  // Add custom column sorting
  customColumns.forEach(col => {
    sortingCallbacks[col.id] = (item: KubeObject) => {
      const value = col.getValue(item);

      // If value is a React element, convert to string for sorting
      return typeof value === "string" || typeof value === "number" ? value : String(value);
    };
  });

  // Build table headers
  const tableHeaders = [
    { title: "Name", className: "name", sortBy: columnIds.name, id: columnIds.name },
    { title: "Namespace", className: "namespace", sortBy: columnIds.namespace, id: columnIds.namespace },
    ...customColumns.map(col => ({
      title: col.title,
      className: col.id,
      sortBy: col.id,
      id: col.id,
    })),
    { title: "Age", className: "age", sortBy: columnIds.age, id: columnIds.age },
  ];

  // Build table contents renderer
  const renderTableContents = (item: KubeObject) => [
    item.getName(),
    <NamespaceSelectBadge key="namespace" namespace={item.getNs() || ""} />,
    ...customColumns.map((col, index) => (
      <React.Fragment key={col.id}>
        {col.getValue(item)}
      </React.Fragment>
    )),
    <KubeObjectAge key="age" object={item} />,
  ];

  return (
    <KubeObjectListLayout
      isConfigurable
      tableId={resourceName}
      className={resourceName}
      store={store}
      sortingCallbacks={sortingCallbacks}
      searchFilters={[
        item => item.getSearchFields(),
      ]}
      renderHeaderTitle={displayName}
      renderTableHeader={tableHeaders}
      renderTableContents={renderTableContents}
    />
  );
};
