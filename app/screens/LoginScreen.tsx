import React, {useCallback, useEffect, useState} from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {FontAwesome5, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import CustomAlert from './CustomAlert';
import {authApi} from "@/app/api";
import {HTTPHeaders} from "@/app/openapi";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {decodeJwt} from "jose";

const {width} = Dimensions.get('window');

export interface Alert {
  visible: boolean
  title: string
  message: string
  type: string,
  buttons: AlertBtn[]
  onClose: () => void
}

export interface AlertBtn {
  text: string
  onPress: () => void
}


type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = (props: LoginScreenProps) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [alert, setAlert] = useState<Alert>();

  const createAuthHeaders = (username: string, password: string): HTTPHeaders => {
    const encodedCredentials = btoa(`${username}:${password}`);
    return {
      Authorization: `Basic ${encodedCredentials}`
    };
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (email && !email.trim() || !validateEmail(email)) {
      setEmailError("Email is required");
      return false;
    }
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    authApi.login(async (requestContext) => {
      return {
        headers: {
          ...requestContext.init.headers,
          ...createAuthHeaders(email, password),
        },
      } as RequestInit;
    }).then(async value => {
      await AsyncStorage.setItem("token", value.accessToken);
      const decodedToken = value.accessToken && decodeJwt(value.accessToken);
      if (decodedToken && (decodedToken['ROLES'] as string[])
        .find(value => value == "ROLE_ADMIN")) {
        props.navigation.replace("AdminHome")
      } else {
        props.navigation.replace("UserTabs")
      }
    }).catch(reason => {
        console.error("Error can't connect:", reason);
        setAlert({
          visible: true,
          title: "Couldn't connect",
          message: reason,
          type: "error",
          onClose: () => {
          },
          buttons: []
        });
        setIsLoading(false);
      }
    )
  }
  const validateToken = useCallback(async (token: string) => {
    try {
      const decodedToken = decodeJwt(token);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decodedToken.exp !== undefined && decodedToken.exp < now;
      const isAccess = decodedToken.TOKEN_TYPE === "ACCESS";

      if (isExpired || !isAccess) {
        throw new Error("Invalid token (Expired or is not Access type)")
      }

      return decodedToken;
    } catch (e) {
      await AsyncStorage.setItem("token", "")
      console.error("Token decoding error:", e);
      return null
    }
  }, [props.navigation]);

  useEffect(() => {
    AsyncStorage.getItem("token").then(value => {
      if (!value) {
        return;
      }
      validateToken(value).then(payload => {
        if (!payload) {
          props.navigation.replace("Login");
          return;
        }
        const roles = payload['ROLES'] as string[];
        if (roles?.includes("ROLE_ADMIN")) {
          props.navigation.replace("AdminHome");
        } else {
          props.navigation.replace("UserTabs");
        }
      });
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f6f7fb"/>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <LinearGradient
              colors={['#3a416f', '#141727']}
              style={styles.logoContainer}
            >
              <FontAwesome5 name="book-reader" size={32} color="#FFFFFF"/>
            </LinearGradient>
            <Text style={styles.title}>Bibliothèque Virtuelle</Text>
            <Text style={styles.subtitle}>Votre espace de lecture personnel</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Connexion</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Adresse email</Text>
              <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (validateEmail(text)) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (text) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity
              disabled={isLoading}
              onPress={handleLogin}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#2B6CB0', '#2B6CB0']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small"/>
                ) : (
                  <View style={styles.buttonContent}>
                    <FontAwesome5 name="sign-in-alt" size={16} color="#FFFFFF"
                                  style={styles.buttonIcon}/>
                    <Text style={styles.buttonText}>SE CONNECTER</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerLink}
            // onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerText}>
              You don't have an account? <Text style={styles.registerTextBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert?.visible!}
        title={alert?.title!}
        message={alert?.message!}
        type={alert?.type!}
        buttons={alert?.buttons || []}
        onClose={() => setAlert(prev => ({...prev!, visible: false}))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginVertical: 32,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#141727",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    height: 50,
  },
  inputError: {
    borderColor: "#E53E3E",
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: "#2D3748",
    fontSize: 15,
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4F6CE1',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  registerLink: {
    alignItems: "center",
    padding: 16,
  },
  registerText: {
    fontSize: 16,
    color: "#4A5568",
  },
  registerTextBold: {
    fontWeight: "bold",
    color: "#3a416f",
  },
});

export default LoginScreen;