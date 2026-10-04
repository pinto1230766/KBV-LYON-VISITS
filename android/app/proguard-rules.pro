# Add project specific ProGuard rules here.
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
    @com.getcapacitor.annotation.PluginMethod public *;
    @com.getcapacitor.annotation.ActivityCallback public *;
    @com.getcapacitor.annotation.PermissionCallback public *;
}
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {*;}
-keep class com.getcapacitor.** {*;}
-keep class com.capacitorjs.plugins.** {*;}
