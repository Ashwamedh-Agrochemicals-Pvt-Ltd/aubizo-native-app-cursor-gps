import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import authApi from "../src/api/auth";
import useAuth from "../src/auth/useAuth";
import {
  AppForm,
  AppFormField,
  SubmitButton,
} from "../src/components/form/appComponents";
import { loginSchema } from "../src/validations/loginSchema";
import showToast from "../src/utility/showToast";
import DESIGN from "../src/theme";
import styles from "../src/styles/login.style";

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { logIn } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleSubmit = async ({ username, password }) => {
    setLoading(true);

    try {
      const response = await authApi.login(username, password);

      if (response.status !== 200 || !response.data?.data?.token) {
        showToast.error(
          "Something went wrong. Please try again.",
          "Login Error"
        );
        return;
      }

      const token = response.data.data.token;
      await logIn(token);

      showToast.success(
        "You have logged in successfully.",
        "✅ Login Successful!"
      );
    } catch (error) {
      showToast.error("Something went wrong. Please try again.", "Login Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Status bar */}
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor={
          Platform.OS === "android" ? DESIGN.colors.primary : "transparent"
        }
      />

      {/* Main Container */}
      <View style={styles.screen}>
        {/* Header */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Aubizo</Text>
          </View>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Login Form Card */}
            <View style={styles.loginCard}>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome back</Text>
              </View>

              {/* Form */}
              <AppForm
                initialValues={{ username: "", password: "" }}
                onSubmit={handleSubmit}
                validationSchema={loginSchema}
              >
                <View style={styles.formSection}>
                  {/* Username Field */}
                  <View style={styles.fieldContainer}>
                    <AppFormField
                      name="username"
                      placeholder="Enter your username"
                      autoCapitalize="none"
                      autoCorrect={false}
                      errorstyle={styles.errorModern}
                    />
                  </View>

                  {/* Password Field */}
                  <View style={styles.fieldContainer}>
                    <AppFormField
                      name="password"
                      placeholder="Enter your password"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!showPassword}
                      errorstyle={styles.errorModern}
                      rightIcon={
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color={DESIGN.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      }
                    />
                  </View>

                  {/* Submit Button */}
                  <View style={styles.buttonContainer}>
                    {loading ? (
                      <View style={styles.loadingButton}>
                        <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                        <Text style={styles.loadingText}>Signing in...</Text>
                      </View>
                    ) : (
                      <SubmitButton
                        title="Sign In"
                        style={styles.submitButton}
                        textStyle={styles.submitButtonText}
                      />
                    )}
                  </View>
                </View>
              </AppForm>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

export default LoginScreen;
