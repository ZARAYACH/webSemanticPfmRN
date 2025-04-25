import React, {useCallback, useState} from "react";
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
import {Alert} from "@/app/screens/LoginScreen";
import {PostUserDto} from "@/app/openapi";
import {signupApi} from "@/app/api";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";

const {width} = Dimensions.get('window');

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen = (props: RegisterScreenProps) => {
  const [postUser, setPostUser] = useState<PostUserDto>(() => ({
    password: '',
    id: 0,
    email: '',
    role: 'USER'
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [alert, setAlert] = useState<Alert>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: [],
    onClose: () => {
    }
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (userDto: PostUserDto) => {
    let isValid = true;

    if (!userDto.email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(userDto.email)) {
      setEmailError("Enter valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!userDto.password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (userDto.password.length < 6) {
      setPasswordError("Enter strong password");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleRegister = useCallback((postUser: PostUserDto) => {
    if (!validateForm(postUser)) return;

    setIsLoading(true);
    signupApi.signUp({postUserDto: postUser})
      .then(() => {
        setAlert({
          visible: true,
          title: "Success",
          message: "Signed up successfully",
          type: "success",
          buttons: [{
            text: "OK",
            onPress: () => props.navigation.navigate("Login")
          }],
          onClose: () => {
          }
        })
      })
      .then(value => props.navigation.navigate("Login"))

      .catch(reason => {
        setAlert({
          visible: true,
          title: "Error",
          message: "error",
          type: "error",
          buttons: [{
            text: "OK", onPress: () => {
            }
          }], onClose: () => {
          }
        })
      }).finally(() => {
      setIsLoading(false);
    })
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
            <Text style={styles.formTitle}>Sign up</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#999"
                  value={postUser.firstName}
                  onChangeText={(text) => {
                    setPostUser(prevState => ({...prevState, firstName: text}))
                  }}
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre email"
                  placeholderTextColor="#999"
                  value={postUser.email}
                  onChangeText={(email) => {
                    setPostUser(prevState => ({...prevState, email}))
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
                  value={postUser.password}
                  onChangeText={(password) => {
                    setPostUser(prevState => ({...prevState, password}))
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
              onPress={() => handleRegister(postUser)}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#2B6CB0', '#1A365D']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.registerButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small"/>
                ) : (
                  <View style={styles.buttonContent}>
                    <FontAwesome5 name="user-plus" size={16} color="#FFFFFF" style={styles.buttonIcon}/>
                    <Text style={styles.buttonText}>CRÉER UN COMPTE</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => props.navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>
              Already have an account ? <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert(prev => ({...prev, visible: false}))}
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
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  registerButton: {
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
  loginLink: {
    alignItems: "center",
    padding: 16,
  },
  loginText: {
    fontSize: 16,
    color: "#4A5568",
  },
  loginTextBold: {
    fontWeight: "bold",
    color: "#3a416f",
  },
});

export default RegisterScreen;