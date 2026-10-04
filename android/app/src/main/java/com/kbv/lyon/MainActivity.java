package com.kbv.lyon;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        // Permettre un positionnement précis sans chevauchement des barres système
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Fond sombre pour les zones système (statut et barre de navigation)
        window.getDecorView().setBackgroundColor(Color.parseColor("#090a0f"));

        // Icônes claires sur fond sombre pour les barres système
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }

        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                // Appliquer les marges exactes :
                // top = barre d'état (évite de passer sous l'horloge/batterie)
                // bottom = barre de navigation Samsung / barre des tâches (évite de passer dessous)
                v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
                return windowInsets;
            });
            ViewCompat.requestApplyInsets(contentView);
        }
    }
}
