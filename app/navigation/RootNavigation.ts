import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from "@/app/(tabs)/HomePage";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(screen : keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(screen, params);
  }
}