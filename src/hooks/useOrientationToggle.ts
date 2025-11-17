// src/hooks/useOrientationToggle.ts
import { useEffect, useState, useCallback } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";

type SimpleOrientation = "portrait" | "landscape";

export function useOrientationToggle() {
  const [orientation, setOrientation] = useState<SimpleOrientation>("portrait");

  // 초기 방향 동기화 + 변경 이벤트 구독
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const info = await ScreenOrientation.orientation();
        if (!isMounted) return;

        const isLandscape = info.type.startsWith("landscape");
        setOrientation(isLandscape ? "landscape" : "portrait");
      } catch (e) {
        console.warn("ScreenOrientation.orientation() 실패", e);
      }
    };

    init();

    const sub = ScreenOrientation.addListener(
      "screenOrientationChange",
      (ev) => {
        const isLandscape = ev.type.startsWith("landscape");
        setOrientation(isLandscape ? "landscape" : "portrait");
      }
    );

    return () => {
      isMounted = false;
      sub.then((s) => s.remove()).catch(() => {});
    };
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (orientation === "portrait") {
        await ScreenOrientation.lock({ orientation: "landscape" });
        setOrientation("landscape");
      } else {
        await ScreenOrientation.lock({ orientation: "portrait" });
        setOrientation("portrait");
      }
    } catch (e) {
      console.warn("ScreenOrientation.lock() 실패", e);
    }
  }, [orientation]);

  return { orientation, toggle };
}
