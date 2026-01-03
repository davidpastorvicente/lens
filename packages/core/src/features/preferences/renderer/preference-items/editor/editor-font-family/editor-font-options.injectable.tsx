/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed } from "mobx";
import React from "react";
import type { SingleValue } from "react-select";
import type { SelectOption } from "../../../../../../renderer/components/select";
import { terminalFontInjectionToken } from "../../../../../terminal/renderer/fonts/token";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import systemMonoFontsInjectable from "../../../../../terminal/renderer/fonts/system-mono-fonts.injectable";

export interface EditorFontPreferencePresenter {
  readonly options: IComputedValue<SelectOption<string>[]>;
  readonly current: IComputedValue<string>;
  onSelection: (selection: SingleValue<SelectOption<string>>) => void;
}

const editorFontPreferencePresenterInjectable = getInjectable({
  id: "editor-font-preference-presenter",
  instantiate: (di): EditorFontPreferencePresenter => {
    const state = di.inject(userPreferencesStateInjectable);
    const terminalFonts = di.injectMany(terminalFontInjectionToken);
    const systemMonoFonts = di.inject(systemMonoFontsInjectable);

    return {
      options: computed(() => {
        // Combine bundled fonts and system mono fonts
        const bundledFonts = terminalFonts.map(font => ({
          label: (
            <span
              style={{
                fontFamily: `${font.name}, var(--font-terminal)`,
                fontSize: state.editorConfiguration.fontSize,
              }}
            >
              {font.name}
            </span>
          ),
          value: font.name,
          isSelected: state.editorConfiguration.fontFamily === font.name,
        }));

        const systemFonts = systemMonoFonts.get().map(font => ({
          label: (
            <span
              style={{
                fontFamily: `"${font.name}", var(--font-terminal)`,
                fontSize: state.editorConfiguration.fontSize,
              }}
            >
              {font.name}
            </span>
          ),
          value: font.name,
          isSelected: state.editorConfiguration.fontFamily === font.name,
        }));

        // Combine and remove duplicates (prefer bundled version)
        const bundledFontNames = new Set(bundledFonts.map(f => f.value));
        const uniqueSystemFonts = systemFonts.filter(f => !bundledFontNames.has(f.value));

        // Sort by name
        const allFonts = [...bundledFonts, ...uniqueSystemFonts];

        return allFonts.sort((a, b) => a.value.localeCompare(b.value));
      }),
      current: computed(() => state.editorConfiguration.fontFamily),
      onSelection: action(selection => {
        state.editorConfiguration.fontFamily = selection?.value ?? "Monaco";
      }),
    };
  },
});

export default editorFontPreferencePresenterInjectable;
