package com.bhakthibookshelf.app;

import android.graphics.PixelFormat;
import android.view.View;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // The reader turns FLAG_SECURE on/off on this window at runtime (the
    // PrivacyScreen plugin, called by the site). Some phones (a vivo on
    // Android 16) ignore FLAG_SECURE added to a window that is already
    // showing, but honour it on a window created with it. So while the
    // flag is on, also show an invisible, touch-through window that is
    // born secure; it keeps screenshots of the reader blank everywhere,
    // and every other screen stays screenshot-friendly.
    private View secureOverlay;

    @Override
    public void onWindowAttributesChanged(WindowManager.LayoutParams params) {
        super.onWindowAttributesChanged(params);
        boolean secure = (params.flags & WindowManager.LayoutParams.FLAG_SECURE) != 0;
        // Posted: the attribute change can arrive mid-layout, and the
        // overlay needs the main window to be attached for its token.
        getWindow().getDecorView().post(() -> {
            if (secure) showSecureOverlay();
            else hideSecureOverlay();
        });
    }

    private void showSecureOverlay() {
        if (secureOverlay != null || isFinishing() || getWindow().getDecorView().getWindowToken() == null) return;
        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_PANEL,
            WindowManager.LayoutParams.FLAG_SECURE
                | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                | WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );
        lp.token = getWindow().getDecorView().getWindowToken();
        lp.setTitle("SecureOverlay");
        View v = new View(this);
        v.setBackgroundColor(0x00000000);
        try {
            getWindowManager().addView(v, lp);
            secureOverlay = v;
        } catch (RuntimeException e) {
            // Window gone (activity closing) — nothing to protect.
        }
    }

    private void hideSecureOverlay() {
        if (secureOverlay == null) return;
        try {
            getWindowManager().removeViewImmediate(secureOverlay);
        } catch (RuntimeException e) {
            // Already detached.
        }
        secureOverlay = null;
    }

    @Override
    public void onDestroy() {
        hideSecureOverlay();
        super.onDestroy();
    }
}
