/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ManagedResourceGroupConfig } from "./managed-resource-group";
import { argoCDResourceGroupConfig } from "./argocd-resource-group.config";
import { certManagerResourceGroupConfig } from "./certmanager-resource-group.config";
import { openShiftResourceGroupConfig } from "./openshift-resource-group.config";

/**
 * Injectable that provides all managed resource group configurations
 * Add new resource groups here (e.g., VPA, Keda, etc.)
 */
const managedResourceGroupsInjectable = getInjectable({
  id: "managed-resource-groups",
  instantiate: (): ManagedResourceGroupConfig[] => [
    argoCDResourceGroupConfig,
    certManagerResourceGroupConfig,
    openShiftResourceGroupConfig,
    // Add more resource groups here:
    // vpaResourceGroupConfig,
    // kedaResourceGroupConfig,
  ],
  lifecycle: lifecycleEnum.singleton,
});

export default managedResourceGroupsInjectable;
