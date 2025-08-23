// screens/Login.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions,
  Animated, StatusBar, Alert, ScrollView, SafeAreaView, Keyboard,
  Platform, findNodeHandle, UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';                  // ✅ NEW

const { width, height } = Dimensions.get('window');
import { BASE_URL } from '../config';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();                                    // ✅ NEW

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const scrollViewRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();

    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      if (scrollViewRef.current && focusedField) {
        let inputHandle;
        if (focusedField === 'email') inputHandle = findNodeHandle(emailInputRef.current);
        else if (focusedField === 'password') inputHandle = findNodeHandle(passwordInputRef.current);

        if (inputHandle) {
          UIManager.measure(inputHandle, (x, y, w, h, pageX, pageY) => {
            const keyboardHeight = e.endCoordinates.height;
            const contentOffset = pageY + h - (height - keyboardHeight) + 50;
            scrollViewRef.current.scrollTo({ y: contentOffset, animated: true });
          });
        }
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      if (scrollViewRef.current) scrollViewRef.current.scrollTo({ y: 0, animated: true });
    });

    return () => { loop.stop(); showSub.remove(); hideSub.remove(); };
  }, [focusedField, fadeAnim, slideAnim, pulseAnim]);

  const handleInputFocus = (field) => setFocusedField(field);
  const handleInputChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // ✅ Save the user globally so Settings can read it
      const user = { name: data.userName, email: data.email || formData.email };
      await signIn(user);
      // also keep a simple fallback key if you want
      await AsyncStorage.setItem('user_email', user.email);

      Alert.alert('Success!', data.message || 'Logged in successfully', [
        {
          text: 'OK',
          onPress: () => {
            setIsLoading(false);
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message === 'AbortError' ? 'Request timed out. Please try again.' : err.message);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={['#10B981', '#047857', '#065F46']}
          style={styles.headerSection}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.illustrationContainer}>
            <Animated.View
              style={[
                styles.car,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [1, 1.05],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.carBody}>
                <LinearGradient
                  colors={['#60A5FA', '#3B82F6']}
                  style={[styles.carMain, { borderColor: '#2563EB' }]}
                />
                <View style={[styles.carRoof, { backgroundColor: '#93C5FD' }]} />
              </View>
              <View style={styles.carWindows}>
                <LinearGradient colors={['#E5E7EB', '#9CA3AF']} style={styles.frontWindow} />
                <LinearGradient colors={['#E5E7EB', '#9CA3AF']} style={styles.backWindow} />
              </View>
              <View style={[styles.wheel1, { backgroundColor: '#1F2937', borderColor: '#FBBF24' }]} />
              <View style={[styles.wheel2, { backgroundColor: '#1F2937', borderColor: '#FBBF24' }]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.gpsRing1,
                {
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.2],
                      }),
                    },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.5, 0.8],
                  }),
                  borderColor: 'rgba(251, 191, 36, 0.6)',
                },
              ]}
            />
            <Animated.View
              style={[
                styles.gpsRing2,
                {
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.7, 1],
                  }),
                  borderColor: 'rgba(251, 191, 36, 0.8)',
                },
              ]}
            />

            <Animated.View style={[styles.locationPin, { transform: [{ translateY: slideAnim }] }]}>
              <View style={[styles.pinHead, { backgroundColor: '#FBBF24', borderColor: '#D97706' }]} />
              <View style={[styles.pinTail, { borderTopColor: '#FBBF24' }]} />
            </Animated.View>
          </View>
        </LinearGradient>

        <View style={styles.formSection}>
          <Text style={styles.title}>Sign In</Text>

          <View style={styles.formInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                ref={emailInputRef}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(v) => handleInputChange('email', v)}
                onFocus={() => handleInputFocus('email')}
                onBlur={() => setFocusedField(null)}
                style={[styles.textInput, focusedField === 'email' && styles.textInputFocused]}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  focusedField === 'password' && styles.textInputFocused,
                ]}
              >
                <TextInput
                  ref={passwordInputRef}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(v) => handleInputChange('password', v)}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.passwordInput}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#10B981', '#065F46']} style={[styles.buttonGradient, { elevation: 5 }]}>
              <Text style={styles.buttonText}>{isLoading ? 'Logging In...' : 'LOGIN'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.signUpText, { color: '#FBBF24' }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { minHeight: height, backgroundColor: '#F9FAFB', paddingTop: 0, paddingBottom: height * 0.25 },
  headerSection: { height: height * 0.35, paddingTop: height * 0.05, paddingHorizontal: width * 0.05, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: {
    width: width * 0.12, height: width * 0.12, borderRadius: width * 0.06,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', alignItems: 'center', justifyContent: 'center',
    marginBottom: height * 0.02, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
  illustrationContainer: { flex: 1, position: 'relative' },
  car: { position: 'absolute', top: '10%', left: '15%', alignItems: 'center' },
  carBody: { position: 'relative' },
  carRoof: { width: 45, height: 22, backgroundColor: '#93C5FD', borderTopLeftRadius: 22, borderTopRightRadius: 22, position: 'absolute', top: -13, left: 12.5, zIndex: 2, elevation: 3 },
  carMain: { width: 70, height: 35, borderRadius: 18, borderWidth: 2, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  carWindows: { position: 'absolute', top: -10, flexDirection: 'row' },
  frontWindow: { width: 18, height: 16, borderTopLeftRadius: 10, borderBottomLeftRadius: 6, marginLeft: 15 },
  backWindow: { width: 18, height: 16, borderTopRightRadius: 10, borderBottomRightRadius: 6, marginLeft: 2 },
  wheel1: { width: 14, height: 14, borderRadius: 7, position: 'absolute', bottom: -7, left: 7, borderWidth: 2, elevation: 3 },
  wheel2: { width: 14, height: 14, borderRadius: 7, position: 'absolute', bottom: -7, right: 7, borderWidth: 2, elevation: 3 },
  gpsRing1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, top: '60%', left: '60%', marginTop: -40, marginLeft: -40, elevation: 2 },
  gpsRing2: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 2, top: '60%', left: '60%', marginTop: -25, marginLeft: -25, elevation: 2 },
  locationPin: { position: 'absolute', top: '20%', right: '10%', alignItems: 'center' },
  pinHead: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  pinTail: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  formSection: { backgroundColor: '#F9FAFB', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: width * 0.06, paddingTop: height * 0.02, paddingBottom: height * 0.15, minHeight: height * 0.65 },
  title: {
    fontSize: Math.min(width * 0.06, 24), fontWeight: '700', color: '#065F46', textAlign: 'center', marginBottom: height * 0.02,
    textShadowColor: 'rgba(16, 185, 129, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  formInputs: { marginBottom: height * 0.02 },
  inputGroup: { marginBottom: height * 0.02 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  textInput: {
    height: 50, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16,
    fontSize: 16, color: '#1F2937', backgroundColor: 'white', elevation: 2,
  },
  textInputFocused: { borderColor: '#10B981', borderWidth: 2, shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', height: 50, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12,
    paddingHorizontal: 16, backgroundColor: 'white', elevation: 2,
  },
  passwordInput: { flex: 1, fontSize: 16, color: '#1F2937' },
  eyeButton: { padding: 5 },
  loginButton: { height: 50, borderRadius: 12, overflow: 'hidden', marginBottom: height * 0.02 },
  loginButtonDisabled: { opacity: 0.7 },
  buttonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#065F46', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { alignItems: 'center', paddingBottom: height * 0.04 },
  footerTextContainer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#6B7280', fontSize: 14 },
  signUpText: { fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
