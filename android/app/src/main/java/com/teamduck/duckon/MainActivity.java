// package com.teamduck.duckon;

// import com.getcapacitor.BridgeActivity;

// public class MainActivity extends BridgeActivity {}

// package com.teamduck.duckon;

// import android.os.Bundle;
// import android.webkit.WebSettings;
// import android.webkit.WebView;
// import com.getcapacitor.BridgeActivity;

// public class MainActivity extends BridgeActivity {
//     @Override
//     public void onCreate(Bundle savedInstanceState) {
//         super.onCreate(savedInstanceState);
        
//         WebView webView = this.bridge.getWebView();
//         WebSettings settings = webView.getSettings();
        
//         // 하드웨어 가속 활성화 (가장 중요!)
//         webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        
//         // 비디오 재생 최적화
//         settings.setMediaPlaybackRequiresUserGesture(false);
        
//         // 렌더링 성능 향상
//         settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        
//         // 캐시 활성화
//         settings.setCacheMode(WebSettings.LOAD_DEFAULT);
//         settings.setAppCacheEnabled(true);
        
//         // 기본 설정
//         settings.setJavaScriptEnabled(true);
//         settings.setDomStorageEnabled(true);
//         settings.setDatabaseEnabled(true);
//     }
// }

// package com.teamduck.duckon;

// import android.os.Bundle;
// import android.webkit.WebSettings;
// import android.webkit.WebView;
// import com.getcapacitor.BridgeActivity;

// public class MainActivity extends BridgeActivity {
//     @Override
//     public void onCreate(Bundle savedInstanceState) {
//         super.onCreate(savedInstanceState);
        
//         WebView webView = this.bridge.getWebView();
//         WebSettings settings = webView.getSettings();
        
//         // 하드웨어 가속 활성화
//         webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        
//         // 비디오 재생 최적화
//         settings.setMediaPlaybackRequiresUserGesture(false);
        
//         // 렌더링 성능 향상
//         settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        
//         // 캐시 설정
//         settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
//         // 기본 설정
//         settings.setJavaScriptEnabled(true);
//         settings.setDomStorageEnabled(true);
//         settings.setDatabaseEnabled(true);
//     }
// }

package com.teamduck.duckon;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 화면 꺼짐 방지 (타이머 정확도 향상)
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        WebView webView = this.bridge.getWebView();
        WebSettings settings = webView.getSettings();
        
        // 하드웨어 가속
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        
        // 비디오 재생 최적화
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // 렌더링 성능
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        
        // 캐시 설정
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // 기본 설정
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Mixed Content 허용
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // 네트워크 최적화
        settings.setLoadsImagesAutomatically(true);
        settings.setBlockNetworkImage(false);
        settings.setBlockNetworkLoads(false);
        
        // 뷰포트 설정
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
    }
    
    @Override
    public void onPause() {
        super.onPause();
        // WebView 타이머 계속 실행
        this.bridge.getWebView().onResume();
    }
}