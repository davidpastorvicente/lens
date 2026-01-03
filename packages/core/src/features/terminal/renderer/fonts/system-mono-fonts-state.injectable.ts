/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable, runInAction } from "mobx";

export interface SystemFont {
  name: string;
}

const systemMonoFontsStateInjectable = getInjectable({
  id: "system-mono-fonts-state",
  instantiate: () => {
    const state = observable.box<SystemFont[]>([]);
    let initialized = false;

    // Async function to load system fonts
    const loadSystemFonts = async () => {
      if (initialized) return;
      initialized = true;

      const monoFonts = new Set<string>();

      // Try the modern Local Font Access API (Chrome 103+)
      try {
        if ("queryLocalFonts" in window) {
          const permission = await (navigator as any).permissions.query({ name: "local-fonts" });
          
          if (permission.state === "granted" || permission.state === "prompt") {
            const fonts = await (window as any).queryLocalFonts();
            
            // Filter for fonts with "Mono" in the name (case-insensitive)
            fonts.forEach((font: any) => {
              const family = font.family || font.fullName;

              if (family && /mono/i.test(family)) {
                monoFonts.add(family);
              }
            });
          }
        }
      } catch (error) {
        console.log("Local Font Access API not available or permission denied:", error);
      }

      // Fallback: Check common monospace fonts
      const commonMonoFonts = [
        "Cascadia Code",
        "Cascadia Mono",
        "Comic Sans Mono",
        "Consolas",
        "Courier",
        "Courier New",
        "DejaVu Sans Mono",
        "Droid Sans Mono",
        "Fantasque Sans Mono",
        "Fira Code",
        "Fira Mono",
        "Hack",
        "Hasklig",
        "Hermit",
        "Inconsolata",
        "Input Mono",
        "Iosevka",
        "JetBrains Mono",
        "Liberation Mono",
        "Menlo",
        "Meslo",
        "Monaco",
        "Monofur",
        "Monoid",
        "Mononoki",
        "Noto Mono",
        "Overpass Mono",
        "Oxygen Mono",
        "PT Mono",
        "Roboto Mono",
        "SF Mono",
        "Source Code Pro",
        "Ubuntu Mono",
        "Victor Mono",
      ];

      // Check which common fonts are available
      for (const fontFamily of commonMonoFonts) {
        try {
          if (document.fonts.check(`12px "${fontFamily}"`)) {
            monoFonts.add(fontFamily);
          }
        } catch {
          // Font check failed, skip it
        }
      }

      // Update state
      runInAction(() => {
        const sortedFonts = Array.from(monoFonts)
          .sort()
          .map(name => ({ name }));

        state.set(sortedFonts);
      });
    };

    // Start loading fonts
    loadSystemFonts();

    return state;
  },
});

export default systemMonoFontsStateInjectable;
