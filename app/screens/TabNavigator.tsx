import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {StyleSheet} from 'react-native';

import UserHomeScreen from './UserHomeScreen';
import StatusBooksScreen from './StatusBooksScreen';
import ProfileUserScreen from './ProfileUserScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          switch (route.name) {
            case 'Home' : return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color}/>
            case 'StatusBooks': return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color}/>
            case 'Profile' : return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color}/>
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
        options={{tabBarLabel: 'Accueil'}}
      />
      <Tab.Screen
        name="StatusBooks"
        component={StatusBooksScreen}
        options={{tabBarLabel: 'Statuts'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileUserScreen}
        options={{tabBarLabel: 'Profil'}}
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