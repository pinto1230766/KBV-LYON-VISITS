package com.kbv.lyon;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Mode natif propre : rétablit la gestion complète et fluide du défilement et du tactile par Chromium
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}

