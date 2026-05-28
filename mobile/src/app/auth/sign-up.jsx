import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";

import { authStyles } from "../../assets/styles/auth.styles";
import { useSignUp } from "@clerk/clerk-expo";
import VerifyEmail from "./verify-email";

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters");

    if (!isLoaded) return;

    setLoading(true);

    try {
      await signUp.create({
    emailAddress: email.trim().toLowerCase(),
    password,
  });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
  console.log("SIGN UP ERROR:", JSON.stringify(err, null, 2));

  let errorMessage = "Something went wrong. Please try again.";

  const code = err?.errors?.[0]?.code;

  if (code === "form_password_pwned") {
    errorMessage =
      "This password is too weak or commonly used. Please choose a stronger password.";
  } else if (code === "form_identifier_exists") {
    errorMessage =
      "An account with this email already exists.";
  } else if (code === "form_password_length_too_short") {
    errorMessage =
      "Password must be at least 8 characters long.";
  } else if (code === "form_param_format_invalid") {
    errorMessage =
      "Please enter a valid email address.";
  }

  Alert.alert("Sign Up Failed", errorMessage);
} finally {
      setLoading(false);
    }
  };

  if (pendingVerification)
    return <VerifyEmail email={email} onBack={() => setPendingVerification(false)} />;

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Container */}
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i2.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Create Account</Text>

          <View style={authStyles.formContainer}>
            {/* Email Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.back()}>
              <Text style={authStyles.linkText}>
                Already have an account? <Text style={authStyles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
