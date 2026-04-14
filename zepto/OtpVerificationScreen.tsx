import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { headlessModule } from './PhoneNumberScreen';
import OTPInput from './OTPInput';
import { useOtplessResult } from '../hooks/useOtplessResult';

type OtpVerificationScreenNavigationProp = {
    route: {
        params: {
            phoneNumber: string;
            deliveryChannel: string;
        };
    };
};

const OtpVerificationScreen = ({ route }: OtpVerificationScreenNavigationProp) => {
    const { phoneNumber, deliveryChannel } = route.params;
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tryingOnChannel, setTryingOnChannel] = useState(deliveryChannel);
    const [isDelivered, setIsDelivered] = useState(false);

    const triggerOtpVerification = (otpValue: string) => {
        const request = {
            phone: phoneNumber,
            countryCode: '91',
            otp: otpValue,
        };
        headlessModule.start(request);
    };

    useOtplessResult({
        otplessModule: headlessModule,
        phoneNumber,
        setError,
        onInitiateSuccess: () => {
            // Already on the OTP screen — nothing to navigate
        },
        onOtpAutoRead: (receivedOtp) => {
            setOtp(receivedOtp);
            setLoading(true);
            triggerOtpVerification(receivedOtp);
        },
        onDeliveryStatus: () => setIsDelivered(true),
        onFallback: (channel) => setTryingOnChannel(channel),
        onError: () => setLoading(false),
    });

    return (
        <View style={styles.container}>
          <Text style={styles.title}>OTP</Text>
          <Text style={styles.subtitle}>Verification</Text>

          <Text style={styles.phoneText}>
            OTP has been sent to <Text style={styles.bold}>+91 {phoneNumber}</Text>
          </Text>

          {/* Delivery status row */}
          <View style={styles.deliveryStatusContainer}>
            {isDelivered ? (
              <View style={styles.checkmarkContainer}>
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              </View>
            ) : (
              <ActivityIndicator size="small" color="#FF5E62" style={styles.deliveryLoader} />
            )}
            <Text style={styles.deliveryText}>
              {isDelivered
                ? `Delivered on ${tryingOnChannel}`
                : `Sending OTP via ${tryingOnChannel}...`}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              onChangeText={(text: string) => {
                setOtp(text);
              }}
              onComplete={undefined}
            />
          </View>

          <LinearGradient
            colors={['#FF5E62', '#FF9966']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.verifyButton, (loading || otp.length < 6) && styles.verifyButtonDisabled]}
          >
            <TouchableOpacity
              style={styles.verifyButtonInner}
              disabled={loading || otp.length < 6}
              onPress={() => {
                setLoading(true);
                triggerOtpVerification(otp);
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.resendLabel}>Didn't get it?</Text>
          <TouchableOpacity
            onPress={() => {
              setIsDelivered(false);
              setTryingOnChannel('SMS');
              const request = {
                phone: phoneNumber,
                countryCode: '91',
                deliveryChannel: 'SMS',
              };
              headlessModule.start(request);
            }}
          >
            <Text style={styles.resendLink}>Send OTP (SMS)</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#4B007D',
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
      },
      title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
      },
      subtitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
      },
      phoneText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
      },
      bold: {
        fontWeight: 'bold',
      },
      deliveryStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 24,
      },
      deliveryLoader: {
        marginRight: 8,
      },
      checkmarkContainer: {
        width: 20,
        height: 20,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      checkmark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
      },
      checkmarkText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
      },
      deliveryText: {
        fontSize: 14,
        color: '#FFFFFF',
      },
      otpContainer: {
        width: '100%',
        marginVertical: 20,
      },
      verifyButton: {
        width: '100%',
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 16,
      },
      verifyButtonDisabled: {
        opacity: 0.5,
      },
      verifyButtonInner: {
        paddingVertical: 14,
        alignItems: 'center',
      },
      verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
      },
      errorText: {
        color: '#FF5C5C',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
      },
      resendLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
        marginTop: 12,
      },
      resendLink: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5E62',
        marginTop: 8,
      },
    });

export default OtpVerificationScreen;
