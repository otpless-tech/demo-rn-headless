import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { useOtplessResult } from '../hooks/useOtplessResult';

// Define screen props with types for route parameters
type NetworkVerificationScreenProps = {
  route: {
    params: {
      backgroundColor: string;
      textColor: string;
      progressColor: string;
      message: string;
      phoneNumber: string;
      otplessModule: any;
    };
  };
  navigation: StackNavigationProp<RootStackParamList, 'NetworkVerificationScreen'>;
};

/**
 * NetworkVerificationScreen
 *
 * This screen is displayed during Silent Network Authentication (SNA) process.
 * It shows a loading state while OTPless attempts to verify the user's phone number
 * through the carrier network without requiring OTP input.
 */
export default function NetworkVerificationScreen() {
  const navigation = useNavigation<NetworkVerificationScreenProps['navigation']>();
  const route = useRoute<RouteProp<RootStackParamList, 'NetworkVerificationScreen'>>();

  // Extract parameters from navigation
  const {
    message = 'Verifying over network...',
    phoneNumber = '',
    otplessModule,
  } = route.params || {};

  const [error, setError] = React.useState('');

  useOtplessResult({
    otplessModule,
    phoneNumber,
    setError,
    onInitiateSuccess: (authType, response) => {
      if (authType === 'OTP') {
        navigation.replace('OtpVerification', {
          phoneNumber,
          deliveryChannel: response.deliveryChannel,
        });
      }
      // SILENT_AUTH: stay on this screen, SNA in progress
    },
    onError: () => {}, // error already set via setError
  });

  // UI for Silent Network Authentication loading screen
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4B007D" />
      <LinearGradient
        colors={['#4B007D', '#6A0DAD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>

            {/* Network authentication icon */}
            <Image source={require('../assets/sna-icons.png')} style={styles.phoneIcon} />
            <Text style={styles.title}>{message}</Text>

            {/* Loading indicator */}
            <View style={styles.progressBarContainer}>
              <ActivityIndicator size="small" color="#FF5E62" style={styles.deliveryLoader} />
              <Text style={styles.loaderText}>This may take a few seconds</Text>
            </View>

            {/* Error message */}
            {error.length > 0 && (
              <Text style={styles.errorText}>{error}</Text>
            )}

          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

// Styles for the UI components
const styles = StyleSheet.create({
  deliveryLoader: {
    marginRight: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  phoneIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 100,
  },
  container2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalWave1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(255, 94, 98, 0.7)',
    backgroundColor: 'transparent',
  },
  signalWave2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255, 94, 98, 0.5)',
    backgroundColor: 'transparent',
  },
  signalWave3: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255, 94, 98, 0.3)',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  phoneNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loader: {
    marginBottom: 10,
  },
  loaderText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF5C5C',
    fontSize: 16,
    marginTop: 16,
  },
});
