/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./argocd-applications.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ArgoCDApplication } from "../../../common/k8s-api/endpoints/argocd-application.api";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";
import type { ArgoCDApplicationStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import argoCDApplicationStoreInjectable from "./store.injectable";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";

enum columnId {
  name = "name",
  namespace = "namespace",
  project = "project",
  source = "source",
  destination = "destination",
  syncStatus = "sync-status",
  healthStatus = "health-status",
  age = "age",
}

interface Dependencies {
  argoCDApplicationStore: ArgoCDApplicationStore;
}

@observer
class NonInjectedArgoCDApplications extends React.Component<Dependencies> {
  render() {
    const { argoCDApplicationStore } = this.props;

    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="argocd_applications"
          className="ArgoCDApplications"
          store={argoCDApplicationStore}
          sortingCallbacks={{
            [columnId.name]: app => app.getName(),
            [columnId.namespace]: app => app.getNs(),
            [columnId.project]: app => app.getProject(),
            [columnId.syncStatus]: app => app.getSyncStatus(),
            [columnId.healthStatus]: app => app.getHealthStatus(),
            [columnId.age]: app => -app.getCreationTimestamp(),
          }}
          searchFilters={[
            app => app.getSearchFields(),
            app => app.getProject(),
          ]}
          renderHeaderTitle="ArgoCD Applications"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            {
              title: "Namespace",
              className: "namespace",
              sortBy: columnId.namespace,
              id: columnId.namespace,
            },
            { title: "Project", className: "project", sortBy: columnId.project, id: columnId.project },
            { title: "Source", className: "source", id: columnId.source },
            { title: "Destination", className: "destination", id: columnId.destination },
            { title: "Sync Status", className: "sync-status", sortBy: columnId.syncStatus, id: columnId.syncStatus },
            { title: "Health Status", className: "health-status", sortBy: columnId.healthStatus, id: columnId.healthStatus },
            { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          ]}
          renderTableContents={(app: ArgoCDApplication) => [
            app.getName(),
            <NamespaceSelectBadge
              key="namespace"
              namespace={app.getNs()}
            />,
            app.getProject(),
            app.getSource(),
            app.getDestination(),
            app.getSyncStatus(),
            app.getHealthStatus(),
            <KubeObjectAge key="age" object={app} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

export const ArgoCDApplications = withInjectables<Dependencies>(NonInjectedArgoCDApplications, {
  getProps: (di) => ({
    argoCDApplicationStore: di.inject(argoCDApplicationStoreInjectable),
  }),
});
