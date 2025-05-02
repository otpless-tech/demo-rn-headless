import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  Dimensions,
  StatusBar,
  SafeAreaView,
  Clipboard,
  Animated
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

type VerificationCompleteScreenProps = {
  route: {
    params: {
      token: string;
      phone: String;
    };
  };
  navigation: any;
};

const VerificationCompleteScreen = ({ route, navigation }: VerificationCompleteScreenProps) => {
  const { token, phone } = route.params;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence for checkmark and content
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const copyToClipboard = () => {
    Clipboard.setString(token);
        Alert.alert('Copied', 'Token has been copied to clipboard');
    Alert.alert('Copied', 'Token has been copied to clipboard');
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
          <View style={styles.content}>
            {/* Animated success checkmark */}
            <Animated.View style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}>
              <View style={styles.outerCircle}>
                <View style={styles.innerCircle}>
                  <Text style={styles.tickMark}>✓</Text>
                </View>
              </View>
            </Animated.View>
            
            {/* Animated content */}
            <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
              <Text style={styles.title}>Verification Complete</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneLabel}>Verified Number:</Text>
                <Text style={styles.phoneNumber}>+91 {phone}</Text>
              </View>
              
              <Text style={styles.subtitle}>
                Your phone number has been successfully verified
              </Text>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={copyToClipboard}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF5E62', '#FF9966']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Copy Token</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'PhoneNumber' }],
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Go Back</Text>
              </TouchableOpacity>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Hassle less with <Text style={styles.highlight}>Otpless</Text> & Deliver now with <Text style={styles.highlight}>Zepto</Text> 🚀
                </Text>
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default VerificationCompleteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkmarkContainer: {
    marginBottom: 40,
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  tickMark: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  phoneContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  phoneLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 48,
    paddingVertical: 16,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});