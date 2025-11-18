import { type ReactNode, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

const isNativeApp = Capacitor.isNativePlatform();

type Props = {
  children: ReactNode;
};

const SwipeBackWrapper = ({ children }: Props) => {
  const navigate = useNavigate();

  // Hooks는 항상 호출해야 하므로 조건문 바깥에 둔다
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isTrackingRef = useRef(false);

  const EDGE_WIDTH = 30;
  const MIN_DISTANCE = 80;
  const MAX_VERTICAL_DRIFT = 50;

  // 이 함수들은 앱일 때만 동작하도록 내부에서 조건 처리함
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!isNativeApp) return;

    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    isTrackingRef.current = touch.clientX <= EDGE_WIDTH;
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!isNativeApp || !isTrackingRef.current) return;

    const touch = e.touches[0];
    const vertical = Math.abs(touch.clientY - startYRef.current);
    if (vertical > MAX_VERTICAL_DRIFT) {
      isTrackingRef.current = false;
    }
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!isNativeApp || !isTrackingRef.current) return;

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - startXRef.current;

    if (diffX > MIN_DISTANCE) {
      navigate(-1);
    }

    isTrackingRef.current = false;
  };

  return (
    <div
      className="w-full h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
};

export default SwipeBackWrapper;
