/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import React from "react";
import type {
  SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import {
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import { noop } from "lodash/fp";

export const argoCDSidebarItemId = "argoCD";

const argoCDSidebarItemsInjectable = getInjectable({
  id: "argocd-sidebar-items",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: argoCDSidebarItemId,
        parentId: null,
        getIcon: () => <Icon svg="argoCD" />,
        title: "ArgoCD",
        onClick: noop,
        orderNumber: 91,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});

export default argoCDSidebarItemsInjectable;
