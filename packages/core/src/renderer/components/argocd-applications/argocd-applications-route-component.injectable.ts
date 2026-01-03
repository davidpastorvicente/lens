/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ArgoCDApplications } from "./argocd-applications";
import argoCDApplicationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/argocd/applications/argocd-applications-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const argoCDApplicationsRouteComponentInjectable = getInjectable({
  id: "argocd-applications-route-component",

  instantiate: (di) => ({
    route: di.inject(argoCDApplicationsRouteInjectable),
    Component: ArgoCDApplications,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default argoCDApplicationsRouteComponentInjectable;
