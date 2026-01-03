/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { storesAndApisCanBeCreatedInjectionToken } from "../../../common/k8s-api/stores-apis-can-be-created.token";
import argoCDApplicationApiInjectable from "../../../common/k8s-api/endpoints/argocd-application.api.injectable";
import { ArgoCDApplicationStore } from "./store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const argoCDApplicationStoreInjectable = getInjectable({
  id: "argocd-application-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "argoCDApplicationStore is only available in certain environments");

    const api = di.inject(argoCDApplicationApiInjectable);

    return new ArgoCDApplicationStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default argoCDApplicationStoreInjectable;
