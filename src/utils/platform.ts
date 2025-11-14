import { Capacitor } from "@capacitor/core";

// 앱(캐패시터)인지, 브라우저 웹인지 구분하는 플래그
export const isNativeApp = Capacitor.isNativePlatform();