/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ArgoCDApplication, ArgoCDApplicationApi } from "../../../common/k8s-api/endpoints/argocd-application.api";
import type { KubeObjectStoreDependencies, KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export class ArgoCDApplicationStore extends KubeObjectStore<ArgoCDApplication, ArgoCDApplicationApi> {
  constructor(protected readonly dependencies: KubeObjectStoreDependencies, api: ArgoCDApplicationApi, opts?: KubeObjectStoreOptions) {
    super(dependencies, api, opts);
  }
}
