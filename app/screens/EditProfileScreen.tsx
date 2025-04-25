import React, {useCallback, useState} from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import CustomAlert from './CustomAlert';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {PostUserDto} from "@/app/openapi";
import {usersApi} from "@/app/api";
import {Alert} from "@/app/screens/LoginScreen";

type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, "EditProfile">;

const EditProfile = (props: EditProfileScreenProps) => {

  const [userDto, setUserDto] = useState<PostUserDto>(() => ({
    email: props.route.params.user.email,
    firstName: props.route.params.user.firstName,
    birthDate: props.route.params.user.birthDate,
    role: props.route.params.user.role,
    password: "",
    id: props.route.params.user.id,
    lastName: props.route.params.user.lastName
  }) as PostUserDto);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<Alert>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: [],
    onClose: () => {
    }
  });


  const handleSave = useCallback((postUserDto: PostUserDto) => {
    setLoading(true);
    usersApi.modifyUser({
      id: userDto.id!,
      postUserDto
    }).then(value => setUserDto({
      id: props.route.params.user.id,
      lastName: value.lastName,
      firstName: value.firstName,
      birthDate: value.birthDate,
      email: value.email,
      password: "",
      role: value.role!
    }))
      .then(() => setAlert({
        visible: true,
        title: 'Success',
        message: 'Profile updated',
        type: 'success',
        buttons: [{
          text: 'OK',
          onPress: () => {
            props.navigation.goBack()
          }
        }], onClose: () => {
        }
      }))
      .catch(() => setAlert({
        visible: true,
        title: 'Error',
        message: "Couldnt update profile",
        type: 'error',
        buttons: [{
          text: 'OK', onPress: () => {
          }
        }], onClose: () => {
        }
      })).finally(() => setLoading(false))
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient
        colors={['#3a416f', '#141727']}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update profile</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F6CE1" style={styles.loader}/>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={userDto.firstName}
                onChangeText={firstName => {
                  setUserDto(prevState => ({...prevState, firstName}))
                  console.log(userDto.firstName)

                }}
                placeholder="Votre nom"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={userDto.lastName}
                onChangeText={lastName =>
                  setUserDto(prevState => ({...prevState, lastName}))}
                placeholder="Votre nom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                editable={false}
                style={styles.input}
                value={userDto.email}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                textContentType={"password"}
                style={styles.input}
                editable={true}
                secureTextEntry={true}
                onChangeText={ password => setUserDto(prevState => ({...prevState, password}))}
                value={userDto.password}
                placeholder="Password"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(userDto)}
            >
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert(prev => ({...prev, visible: false}))}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  loader: {
    marginTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#4F6CE1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;