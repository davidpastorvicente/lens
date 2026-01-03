/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import systemMonoFontsStateInjectable from "./system-mono-fonts-state.injectable";

export interface SystemFont {
  name: string;
}

const systemMonoFontsInjectable = getInjectable({
  id: "system-mono-fonts",
  instantiate: (di) => {
    const state = di.inject(systemMonoFontsStateInjectable);
    
    return computed(() => state.get());
  },
});

export default systemMonoFontsInjectable;
