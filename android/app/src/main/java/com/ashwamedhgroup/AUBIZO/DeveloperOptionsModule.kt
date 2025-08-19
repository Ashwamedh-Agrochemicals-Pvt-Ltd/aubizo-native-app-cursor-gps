package com.ashwamedhgroup.AUBIZO

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeveloperOptionsModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "DeveloperOptionsModule"

  @ReactMethod
  fun isDeveloperOptionsEnabled(promise: Promise) {
    try {
      val value = Settings.Global.getInt(
        reactContext.contentResolver,
        Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
        0
      )
      promise.resolve(value == 1)
    } catch (e: Exception) {
      promise.reject("E_DEV_OPTIONS", e)
    }
  }

  // Optional helper to jump straight to Developer Options
  @ReactMethod
  fun openDeveloperOptions(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      // Fallback to general Settings if specific screen fails
      try {
        val fallback = Intent(Settings.ACTION_SETTINGS).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(fallback)
        promise.resolve(true)
      } catch (e2: Exception) {
        promise.reject("E_OPEN_SETTINGS", e2)
      }
    }
  }
}
