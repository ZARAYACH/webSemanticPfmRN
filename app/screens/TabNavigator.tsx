import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {StyleSheet} from 'react-native';

import UserHomeScreen from './UserHomeScreen';
import StatusBorrowsScreen from './StatusBorrowsScreen';
import ProfileUserScreen from './ProfileUserScreen';
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {decodeJwt} from "jose";
import AdminTabNavigator from "@/app/Styles/AdminTabNavigator";
import HomeScreen from "@/app/screens/HomeScreen";
import AdminBorrowManagementScreen from "@/app/screens/AdminBorrowManagementScreen";


const Tab = createBottomTabNavigator<RootStackParamList>();

const TabNavigator = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("token").then(value => {
      if (!value) {
        return;
      }
      const decodedToken = decodeJwt(value);
      if (!decodedToken) {
        return;
      }

      const roles = decodedToken['ROLES'] as string[];
      if (roles?.includes("ROLE_ADMIN")) {
        setIsAdmin(true)
      }

    });
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          switch (route.name) {
            case 'Home' :
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color}/>
            case 'StatusBorrows':
              return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color}/>
            case 'Profile' :
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color}/>
          }
        },
        tabBarActiveTintColor: '#4F6CE1',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="StatusBorrows"
        component={StatusBorrowsScreen}
        options={{tabBarLabel: 'Status'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileUserScreen}
        options={{tabBarLabel: 'Profile'}}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 5,
    paddingTop: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TabNavigator;