/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, KubeObjectScope } from "@k8slens/kube-object";
import { KubeObject } from "@k8slens/kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";

export interface ArgoCDApplicationSpec {
  source?: {
    repoURL?: string;
    path?: string;
    targetRevision?: string;
    chart?: string;
  };
  destination?: {
    server?: string;
    namespace?: string;
  };
  project?: string;
}

export interface ArgoCDApplicationStatus {
  sync?: {
    status?: string;
  };
  health?: {
    status?: string;
  };
}

export class ArgoCDApplication extends KubeObject<
  KubeObjectMetadata<KubeObjectScope.Namespace>,
  ArgoCDApplicationStatus,
  ArgoCDApplicationSpec
> {
  static kind = "Application";
  static namespaced = true;
  static apiBase = "/apis/argoproj.io/v1alpha1/applications";

  getSource() {
    return this.spec?.source?.repoURL || this.spec?.source?.chart || "";
  }

  getDestination() {
    return this.spec?.destination?.namespace || "";
  }

  getSyncStatus() {
    return this.status?.sync?.status || "Unknown";
  }

  getHealthStatus() {
    return this.status?.health?.status || "Unknown";
  }

  getProject() {
    return this.spec?.project || "default";
  }
}

export class ArgoCDApplicationApi extends KubeApi<ArgoCDApplication> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      objectConstructor: ArgoCDApplication,
      ...opts ?? {},
    });
  }
}
