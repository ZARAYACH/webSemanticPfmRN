import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import type { StaticScreenProps } from '@react-navigation/native';

import HomeScreen from './HomeScreen';
import AdminBorrowManagementScreen from './AdminBorrowManagementScreen';
import styles from '../Styles/AdminTabNavigator';
import {RootStackParamList} from "@/app/(tabs)/HomePage";

const Tab = createBottomTabNavigator<RootStackParamList>();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          switch (route.name) {
            case 'AdminHome' :
              return <Ionicons name={focused ? 'library' : 'library-outline'} size={size} color={color}/>
            case 'BorrowManagement' :
              return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color}/>

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
        name="AdminHome"
        component={HomeScreen}
        options={{tabBarLabel: 'Bibliothèque'}}
      />
      <Tab.Screen
        name="BorrowManagement"
        component={AdminBorrowManagementScreen}
        options={{tabBarLabel: 'Emprunts'}}
      />
    </Tab.Navigator>
  );
};


export default AdminTabNavigator;