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

    const validateForm = useCallback((email: string, password: string) => {
      if (email && !email.trim() || !validateEmail(email)) {
        setEmailError("Email is required");
        return false;
      }
      if (!password) {
        setPasswordError("Password is required");
        return false;
      }
      return true;
    }, []);

    const handleLogin = useCallback(async (email: string, password: string) => {
      if (!validateForm(email, password)) return;
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
          props.navigation.replace("AdminTabs", {screen : "AdminHome"})
        } else {
          props.navigation.replace("UserTabs", {screen: "Home"})
        }
      }).catch(reason => {
        console.error("Error can't connect:", reason);
        setAlert({
          visible: true,
          title: "Bad credentials",
          message: "Bad credentials",
          type: "error",
          onClose: () => {
          },
          buttons: []
        });
      }).finally(() => setIsLoading(false)
      )
      return;
    }, [])

    const validateToken = useCallback(async (token: string) => {
      try {
        const decodedToken = decodeJwt(token);
        const isAccess = decodedToken.TOKEN_TYPE === "ACCESS";

        if (!isAccess) {
          throw new Error("Invalid token (not Access Token)")
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
            props.navigation.replace("AdminTabs", {screen : "AdminHome"});
          } else {
            props.navigation.navigate("UserTabs", {screen: "Home"});
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
                    onChangeText={(text) => setEmail(text)}
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
                onPress={() => handleLogin(email, password)}
                style={styles.buttonContainer}
              >
                <LinearGradient
                  colors={['#020609', '#020609FF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.loginButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small"/>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Login</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => props.navigation.navigate("Register")}
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
  }
;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    marginTop: 200
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    verticalAlign: "middle"
  },
  header: {
    alignItems: "center",
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