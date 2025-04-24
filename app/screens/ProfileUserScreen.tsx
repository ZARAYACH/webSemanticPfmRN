import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import {UserDto} from "@/app/openapi";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {Alert} from "@/app/screens/LoginScreen";
import {authApi, usersApi} from "@/app/api";

type ProfileUserScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileUserScreen = (props: ProfileUserScreenProps) => {
  const [userData, setUserData] = useState<UserDto>({
    email: '',
    id: 0
  });
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

  const fetchUserData = useCallback( () => {
    setLoading(true);
    usersApi.getMe()
      .then(value => setUserData(value))
      .catch(() => {
        setAlert({
          visible: true,
          title: 'Error',
          message: 'Couldnt load user data',
          type: 'error',
          buttons: [{
            text: 'OK', onPress: () => {
            }
          }],
          onClose: () => {
          }
        })
      }).finally(() => setLoading(false))
  }, [props.navigation]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setAlert({
      visible: true,
      title: 'Logout',
      message: 'Are you sure wanna logout ?',
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {
          }
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await authApi.logout()
              await AsyncStorage.removeItem('token');
              props.navigation.navigate('Login');
            } catch (error) {
              setAlert({
                visible: true,
                title: 'Error',
                message: 'Couldnt logout',
                type: 'error',
                buttons: [{
                  text: 'OK', onPress: () => {
                  }
                }], onClose: () => {
                }
              });
            }
          }
        }
      ], onClose: () => {
      }
    });
  };


  return (
    <ScrollView style={styles.mainContainer}>
      <StatusBar barStyle="light-content"/>

      <LinearGradient
        colors={['#3a416f', '#141727']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>My Profile</Text>
      </LinearGradient>

      <View style={styles.profileContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F6CE1" style={styles.loader}/>
        ) : (
          <>
            <Text style={styles.userName}>{userData?.firstName} {userData?.lastName}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>


            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>  props.navigation.navigate('EditProfile', {user : userData})}
              >
                <Ionicons name="person-outline" size={24} color="#4F6CE1"/>
                <Text style={styles.menuItemText}>Update my profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0"/>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#E53E3E"/>
                <Text style={[styles.menuItemText, {color: '#E53E3E'}]}>Logout</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0"/>
              </TouchableOpacity>
            </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    marginTop: 40,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4F6CE1',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F6CE1',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 15,
  },
  menuContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#2D3748',
  },
  // Styles pour les fonctionnalités de débogage
  debugButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  debugInfoContainer: {
    backgroundColor: '#2C3E50',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
  },
  debugInfoTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugInfoText: {
    color: '#EEEEEE',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
export default ProfileUserScreen;