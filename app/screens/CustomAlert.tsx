import React, {useEffect} from 'react';
import {Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Alert} from "./LoginScreen";
import {LinearGradient} from "expo-linear-gradient";

const CustomAlert = (alert: Alert) => {
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (alert.visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [alert.visible]);

  let iconName, gradientColors, iconColor, iconBgColor;
  switch (alert.type) {
    case 'success':
      iconName = 'checkmark-circle';
      gradientColors = ['#38A169', '#10B981'];
      iconColor = '#ECFDF5';
      iconBgColor = 'rgba(16, 185, 129, 0.15)';
      break;
    case 'error':
      iconName = 'close-circle';
      gradientColors = ['#E53E3E', '#EF4444'];
      iconColor = '#FEF2F2';
      iconBgColor = 'rgba(239, 68, 68, 0.15)';
      break;
    case 'warning':
      iconName = 'warning';
      gradientColors = ['#ED8936', '#F59E0B'];
      iconColor = '#FFFBEB';
      iconBgColor = 'rgba(245, 158, 11, 0.15)';
      break;
    case 'info':
      iconName = 'information-circle';
      gradientColors = ['#4F6CE1', '#7D55F3'];
      iconColor = '#EFF6FF';
      iconBgColor = 'rgba(79, 108, 225, 0.15)';
      break;
    default:
      iconName = 'book';
      gradientColors = ['#4F6CE1', '#7D55F3'];
      iconColor = '#EFF6FF';
      iconBgColor = 'rgba(79, 108, 225, 0.15)';
  }

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').height, 0]
  });

  return (
    <Modal
      transparent={true}
      visible={alert.visible}
      animationType="none"
      onRequestClose={alert.onClose}
    >
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalOverlay,
            {opacity: fadeAnim}
          ]}
        >
          <TouchableOpacity
            style={{flex: 1}}
            activeOpacity={1}
            onPress={alert.onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalView,
            {
              transform: [{translateY: slideInterpolate}]
            }
          ]}
        >
          <View style={[styles.iconBackground, {backgroundColor: iconBgColor}]}>
            <View style={styles.iconContainer}>
              <Ionicons name={iconName as any} size={40} color={gradientColors[0]}/>
            </View>
          </View>

          <Text style={styles.modalTitle}>{alert.title}</Text>
          <Text style={styles.modalMessage}>{alert.message}</Text>

          <View style={styles.buttonContainer}>
            {alert.buttons.length > 0 ? (
              alert.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    index > 0 && {marginTop: 10}
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    alert.onClose();
                  }}
                >
                  {index === 0 ? (
                    <LinearGradient
                      colors={gradientColors as any}
                      style={styles.buttonGradient}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                    >
                      <Text style={styles.buttonText}>{button.text}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.secondaryButton}>
                      <LinearGradient
                        colors={gradientColors as any}
                        style={styles.buttonGradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                      >
                        <Text style={styles.secondaryButtonText}>{button.text}</Text>
                      </LinearGradient>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={alert.onClose}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  iconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalMessage: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  buttonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default CustomAlert;