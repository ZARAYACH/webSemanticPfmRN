import {NavigationContainerRef} from '@react-navigation/native';
import {createRef} from 'react';
import {RootStackParamList} from "@/app/(tabs)/HomePage";

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}
