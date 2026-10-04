package com.kbv.lyon;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Empêche la barre de navigation système (boutons Samsung) de recouvrir l'application
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
