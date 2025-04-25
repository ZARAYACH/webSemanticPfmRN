import React, {useEffect, useState} from "react";
import {createStackNavigator} from "@react-navigation/stack";

import RegisterScreen from "../screens/RegisterScreen";

import AddBookScreen from "../screens/AddBookScreen";
import EditBookScreen from "../screens/EditBookScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import BookDetailsScreenUser from "../screens/BookDetailsUserScreen";
import TabNavigator from "../screens/TabNavigator";
import AdminTabNavigator from "../screens/AdminTabNavigator";

import EditProfileScreen from "../screens/EditProfileScreen";
import LoginScreen from "@/app/screens/LoginScreen";
import HomeScreen from "@/app/screens/HomeScreen";
import AdminBorrowManagementScreen from "@/app/screens/AdminBorrowManagementScreen";
import {UserDto} from "@/app/openapi";


export type RootStackParamList = {
  Login: undefined;
  Register: undefined
  ForgotPassword: undefined
  ResetPassword: undefined
  AdminTabs: {
    screen: string
  }
  AddBook: undefined
  EditBook: {
    bookId: number
  }
  BookDetails: {
    bookId: number
  }
  UserTabs: {
    screen: string
  }
  DetailsUser: {
    bookId: number
  }
  EditProfile: {
    user: UserDto
  }
  ChangePassword: undefined
  BorrowHistory: undefined
  Settings: undefined
  AdminHome: undefined
  BorrowManagement: undefined
  StatusBorrows: undefined
  Home: undefined
  Profile: {
    user : UserDto
  }

};

const Stack = createStackNavigator<RootStackParamList>();

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // const checkToken = async () => {
    //   try {
    //     const token = await AsyncStorage.getItem("token");
    //     const role = await AsyncStorage.getItem("userRole");
    //     setUserToken(token);
    //     setUserRole(role);
    //   } catch (error) {
    //     console.error("Erreur lors de la récupération des données:", error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // checkToken();
  }, []);
  //
  // if (isLoading) {
  //   return <LoadingScreen/>;
  // }

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
      <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}}/>

      <Stack.Screen
        name="AdminTabs"
        component={AdminTabNavigator}
        options={{headerShown: false}}
      />

      <Stack.Screen name="AddBook" component={AddBookScreen} options={{headerShown: false}}/>
      <Stack.Screen name="EditBook" component={EditBookScreen} options={{headerShown: false}}/>
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="UserTabs"
        component={TabNavigator}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="DetailsUser"
        component={BookDetailsScreenUser}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="AdminHome"
        component={HomeScreen}
      />
      <Stack.Screen
        name="BorrowManagement"
        component={AdminBorrowManagementScreen}
      />


    </Stack.Navigator>

  );
}