/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ArgoCDApplicationsPathParameters } from "./argocd-applications-route.injectable";
import argoCDApplicationsRouteInjectable from "./argocd-applications-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

export type NavigateToArgoCDApplications = (parameters?: ArgoCDApplicationsPathParameters) => void;

const navigateToArgoCDApplicationsInjectable = getInjectable({
  id: "navigate-to-argocd-applications",

  instantiate: (di): NavigateToArgoCDApplications => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(argoCDApplicationsRouteInjectable);

    return (parameters) =>
      navigateToRoute(route, {
        parameters,
      });
  },
});

export default navigateToArgoCDApplicationsInjectable;
