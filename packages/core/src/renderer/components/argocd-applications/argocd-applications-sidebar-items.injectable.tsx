/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import argoCDApplicationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/argocd/applications/argocd-applications-route.injectable";
import { argoCDSidebarItemId } from "../argocd/argocd-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToArgoCDApplicationsInjectable from "../../../common/front-end-routing/routes/cluster/argocd/applications/navigate-to-argocd-applications.injectable";

const argoCDApplicationsSidebarItemsInjectable = getInjectable({
  id: "argocd-applications-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(argoCDApplicationsRouteInjectable);
    const navigateToArgoCDApplications = di.inject(navigateToArgoCDApplicationsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "argocd-applications",
        parentId: argoCDSidebarItemId,
        title: "Applications",
        onClick: navigateToArgoCDApplications,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default argoCDApplicationsSidebarItemsInjectable;
