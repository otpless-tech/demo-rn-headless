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

export default function NetworkVerificationScreen() {
  const navigation = useNavigation<NetworkVerificationScreenProps['navigation']>();
  const route = useRoute<RouteProp<RootStackParamList, 'NetworkVerificationScreen'>>();

  const {
    backgroundColor = '#4B007D',
    textColor = '#FFFFFF',
    progressColor = '#FF5C5C',
    message = 'Verifying over network...',
    phoneNumber = '',
    otplessModule
  } = route.params || {};

  useEffect(() => {
    otplessModule.setResponseCallback(onHeadlessResult);
  }, []);

  const navigate = (token: string) => {
    console.log("Navigating to screen with token:", token);
    navigation.navigate('VerificationSuccessScreen', {
      token,
      phone: phoneNumber,
    });
  };

  const onHeadlessResult = (result: any) => {
    otplessModule.commitResponse(result);
    const responseType = result.responseType;

    switch (responseType) {
      case "SDK_READY":
        console.log("SDK is ready");
        break;
      case "FAILED":
        console.log("SDK initialization failed");
        break;
      case "INITIATE":
        if (result.statusCode === 200) {
          console.log("Headless authentication initiated");
          const authType = result.response.authType;
          if (authType === "OTP") {
            // Handle OTP verification
            navigation.replace("OtpVerification", {
              phoneNumber: phoneNumber,
              deliveryChannel: result.response.deliveryChannel,
            });
          } else if (authType === "SILENT_AUTH") {
            // Handle Silent Authentication initiation by showing loading status
          }
        }
        break;
      case "OTP_AUTO_READ":
        if (Platform.OS === "android") {
          const otp = result.response.otp;
          console.log(`OTP Received: ${otp}`);
        }
        break;
      case "VERIFY":
        
        break;
      case "DELIVERY_STATUS":
        const authType = result.response.authType;
        const deliveryChannel = result.response.deliveryChannel;
        break;
      case "ONETAP":
        const token = result.response.data.token;
        if (token != null) {
          console.log(`OneTap Data: ${token}`);
          navigate(token);
        }
        break;
      case "FALLBACK_TRIGGERED":
        if (result.response.deliveryChannel != null) {
          const newDeliveryChannel = result.response.deliveryChannel;
        }
        break;
      default:
        console.warn(`Unknown response type: ${responseType}`);
        break;
    }
  };

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
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>zepto</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.animationContainer}>
              <View style={styles.phoneIconContainer}>
                <View style={styles.phoneIcon} />
                <View style={styles.signalWave1} />
                <View style={styles.signalWave2} />
                <View style={styles.signalWave3} />
              </View>
            </View>
            
            <Text style={styles.title}>{message}</Text>
            <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>
            
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF5E62" style={styles.loader} />
              <Text style={styles.loaderText}>This may take a few seconds...</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Silent Authentication
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
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
  phoneIcon: {
    width: 50,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    fontSize: 14,
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