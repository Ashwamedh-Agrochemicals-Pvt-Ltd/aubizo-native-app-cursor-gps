import { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import authApi from "../src/api/auth";
import useAuth from "../src/auth/useAuth";
import AppForm from "../src/components/form/appComponents/AppForm";
import AppFormField from "../src/components/form/appComponents/AppFormField";
import SubmitButton from "../src/components/form/appComponents/SubmitButton";
import { loginSchema } from "../src/validations/loginSchema";
import showToast from "../src/utility/showToast";
import DESIGN from "../src/theme";
import styles from "../src/styles/login.style";
import { StatusBar } from "expo-status-bar";
import { getBrandConfig } from "../src/config/appConfig";

const { brandName, logo } = getBrandConfig();

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const { logIn } = useAuth();
  global.usernameRef = useRef(null);
  global.passwordRef = useRef(null);

  const handleSubmit = async ({ username, password }) => {
    setLoading(true);
    setFormError("");

    try {
      const response = await authApi.login(username.trim(), password.trim());

      // If API returns status=false OR 400 error from backend
      if (!response.data?.status) {
        const errorMessage = response.data?.message || "Invalid credentials";
        setFormError(errorMessage);
        showToast.error("Login Failed", errorMessage);
        return;
      }

      // Success Token Handling
      const accessToken = response.data?.data?.access;
      const refreshToken = response.data?.data?.refresh;
      const userName = response.data?.data?.user_name;

      if (!accessToken || !refreshToken) {
        setFormError("Something went wrong. Please try again.");
        return;
      }

      await logIn(accessToken, refreshToken, userName);
      showToast.success("You have logged in successfully.", "Login Successful!");

    } catch (error) {
      console.log("ERROR FULL:", error);

      let errorMessage = "Something went wrong";

      if (error?.detail?.message) {
        errorMessage = "Invalid Credentials";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setFormError(errorMessage);
      showToast.error("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }

  };

  return (
    <>
      <StatusBar style="auto" translucent={false} />
      <View style={styles.screen}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : "height"}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >

          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.loginCard}>
              <Image source={logo} style={styles.logo} />

              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome back</Text>
                <Text style={styles.welcomeSubtitle}>Sign in to {brandName}</Text>
              </View>

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <AppForm
                initialValues={{ username: "", password: "" }}
                onSubmit={handleSubmit}
                validationSchema={loginSchema}
              >
                <View style={styles.formSection}>
                  <View style={styles.fieldContainer}>
                    <AppFormField
                      name="username"
                      icon="account"
                      innerRef={global.usernameRef}
                      placeholder="Enter your username"
                      autoCapitalize="none"
                      autoCorrect={false}
                      error={false}
                      style={styles.inputContainer}
                    />
                  </View>

                  <View style={{ marginBottom: DESIGN.spacing.lg }}>
                    <AppFormField
                      name="password"
                      icon="lock"
                      innerRef={global.passwordRef}
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      error={false}
                      style={styles.inputContainer}
                      rightIcon={
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color={DESIGN.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      }
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <SubmitButton
                      title={loading ? "Signing in..." : "Sign In"}
                      loading={loading}
                      style={styles.submitButton}
                      styleButtonText={styles.submitButtonText}
                    />
                  </View>

                  {/* Secured Info */}
                  <View style={styles.ssoContainer}>
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={18}
                      color={"#007955"}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.ssoText}>Authorized Staff Login</Text>
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


