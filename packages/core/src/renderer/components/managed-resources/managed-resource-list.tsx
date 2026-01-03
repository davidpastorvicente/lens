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

export interface ManagedResourceListProps {
  store: CustomResourceStore<KubeObject>;
  resourceName: string;
  displayName: string;
}

/**
 * Generic list component for managed resources
 * Renders a table with Name, Namespace, and Age columns
 */
export const ManagedResourceList = ({ store, resourceName, displayName }: ManagedResourceListProps) => {
  return (
    <KubeObjectListLayout
      isConfigurable
      tableId={resourceName}
      className={resourceName}
      store={store}
      sortingCallbacks={{
        name: item => item.getName(),
        namespace: item => item.getNs(),
        age: item => -item.getCreationTimestamp(),
      }}
      searchFilters={[
        item => item.getSearchFields(),
      ]}
      renderHeaderTitle={displayName}
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: "name", id: "name" },
        { title: "Namespace", className: "namespace", sortBy: "namespace", id: "namespace" },
        { title: "Age", className: "age", sortBy: "age", id: "age" },
      ]}
      renderTableContents={item => [
        item.getName(),
        <NamespaceSelectBadge key="namespace" namespace={item.getNs() || ""} />,
        <KubeObjectAge key="age" object={item} />,
      ]}
    />
  );
};
