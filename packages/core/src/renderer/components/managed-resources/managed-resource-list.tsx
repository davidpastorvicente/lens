/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { KubeObject, CustomResourceDefinition } from "@k8slens/kube-object";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import type { CustomResourceStore } from "../../../common/k8s-api/api-manager/resource.store";
import { formatJSONValue, safeJSONPathValue } from "@k8slens/utilities";
import type { TableCellProps } from "@k8slens/list-layout";

export interface ManagedResourceListProps {
  store: CustomResourceStore<KubeObject>;
  resourceName: string;
  displayName: string;
  crd?: CustomResourceDefinition;
  isNamespaced: boolean;
}

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

/**
 * Generic list component for managed resources
 * Automatically detects columns from CRD printer columns (same as Custom Resources section)
 * Renders a table with Name, Namespace, extra columns from CRD, and Age
 */
export const ManagedResourceList = ({ store, resourceName, displayName, crd, isNamespaced }: ManagedResourceListProps) => {
  // Get printer columns from CRD (same as Custom Resources does)
  const extraColumns = crd?.getPrinterColumns(false) || [];

  return (
    <KubeObjectListLayout
      isConfigurable
      tableId={resourceName}
      className={resourceName}
      store={store}
      sortingCallbacks={{
        [columnId.name]: item => item.getName(),
        [columnId.namespace]: item => item.getNs(),
        [columnId.age]: item => -item.getCreationTimestamp(),
        ...Object.fromEntries(extraColumns.map(({ name, jsonPath }) => [
          name,
          item => formatJSONValue(safeJSONPathValue(item, jsonPath)),
        ])),
      }}
      searchFilters={[
        item => item.getSearchFields(),
      ]}
      renderHeaderTitle={displayName}
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        isNamespaced
          ? { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace }
          : undefined,
        ...extraColumns.map(({ name }) => ({
          title: name,
          className: name.toLowerCase().replace(/\s+/g, "-"),
          sortBy: name,
          id: name,
        })),
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={item => [
        item.getName(),
        isNamespaced && (
          <NamespaceSelectBadge namespace={item.getNs() as string} />
        ),
        ...extraColumns.map((column): TableCellProps => ({
          title: formatJSONValue(safeJSONPathValue(item, column.jsonPath)),
        })),
        <KubeObjectAge key="age" object={item} />,
      ]}
    />
  );
};
