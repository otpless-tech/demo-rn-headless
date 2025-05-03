import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    backgroundColor = '#4B007D',
    textColor = '#FFFFFF',
    progressColor = '#FF5C5C',
    message = 'Verifying over network...',
    phoneNumber = '',
    otplessModule
  } = route.params || {};

  // Set up response callback when component mounts
  useEffect(() => {
    otplessModule.setResponseCallback(onHeadlessResult);
  }, []);

  // Navigate to success screen with authentication token
  const navigate = (token: string) => {
    console.log("Navigating to screen with token:", token);
    navigation.navigate('VerificationSuccessScreen', {
      token,
      phone: phoneNumber,
    });
  };

  // Handle responses from OTPless SDK during Silent Authentication
  const onHeadlessResult = (result: any) => {
    otplessModule.commitResponse(result);
    const responseType = result.responseType;

    switch (responseType) {
      case "SDK_READY":
        // SDK is initialized and ready
        console.log("SDK is ready");
        break;
      case "FAILED":
        // SDK initialization failed
        console.log("SDK initialization failed");
        break;
      case "INITIATE":
        if (result.statusCode === 200) {
          console.log("Headless authentication initiated");
          const authType = result.response.authType;
          if (authType === "OTP") {
            // If Silent Auth failed and fallback to OTP is configured,
            // navigate to OTP verification screen
            navigation.replace("OtpVerification", {
              phoneNumber: phoneNumber,
              deliveryChannel: result.response.deliveryChannel,
            });
          } else if (authType === "SILENT_AUTH") {
            // Continue showing SNA loading screen
          }
        }
        break;
      case "OTP_AUTO_READ":
        // Auto-detect OTP (Android only)
        if (Platform.OS === "android") {
          const otp = result.response.otp;
          console.log(`OTP Received: ${otp}`);
        }
        break;
      case "VERIFY":
        // Handle verification response
        break;
      case "DELIVERY_STATUS":
        // OTP delivery status updates
        const authType = result.response.authType;
        const deliveryChannel = result.response.deliveryChannel;
        break;
      case "ONETAP":
        // Handle successful authentication
        const token = result.response.data.token;
        if (token != null) {
          console.log(`OneTap Data: ${token}`);
          navigate(token);
        }
        break;
      case "FALLBACK_TRIGGERED":
        // Handle fallback to different authentication method
        if (result.response.deliveryChannel != null) {
          const newDeliveryChannel = result.response.deliveryChannel;
        }
        break;
      default:
        console.warn(`Unknown response type: ${responseType}`);
        break;
    }
  };

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
    marginBottom: 12,   // spacing below
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
    marginBottom: 16,  // <-- add this
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
    flexDirection: 'row',   // Ensures left to right layout
    alignItems: 'center',   // Vertically centers items
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
  }
});