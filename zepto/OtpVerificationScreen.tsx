import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator
} from 'react-native';

import { headlessModule } from './PhoneNumberScreen';
import OTPInput from './OTPInput';

type OtpVerificationScreenNavigationProp = {
    route: {
        params: {
            phoneNumber: string;
            deliveryChannel: string;
        };
    };
    navigation: any;
};

const OtpVerificationScreen = ({ route, navigation }: OtpVerificationScreenNavigationProp) => {
    const { phoneNumber, deliveryChannel } = route.params;
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [tryingOnChannel, setTryingOnChannel] = useState(deliveryChannel);
    const [isDelivered, setIsDelivered] = useState(false);


    const onHeadlessResult = (result: any) => {
        headlessModule.commitResponse(result);
        const responseType = result.responseType;

        switch (responseType) {
            case "SDK_READY": {
                console.log("SDK is ready");
                break;
            }
            case "FAILED": {
                console.log("SDK initialization failed");
                break;
            }
            case "INITIATE": {
                if (result.statusCode === 200) {
                    console.log("Headless authentication initiated");
                    const authType = result.response.authType;
                    if (authType === "OTP") {
                        // Take user to OTP verification screen
                    } else if (authType === "SILENT_AUTH") {
                        // Handle Silent Authentication initiation
                    }
                } else {
                    setError(result.response.errorMessage);
                }
                break;
            }
            case "OTP_AUTO_READ": {
                if (Platform.OS === "android") {
                    const otp = result.response.otp;
                    console.log(`OTP Received: ${otp}`);
                    setOtp(otp);
                    triggerOtpVerification(otp);
                }
                break;
            }
            case "VERIFY": {
                setError(result.response.errorMessage);
                break;
            }
            case "DELIVERY_STATUS": {
                const authType = result.response.authType;
                const deliveryChannel = result.response.deliveryChannel;
                setIsDelivered(true);
                break;
            }

            case "ONETAP": {
                console.log("OneTap response received");
                const token = result.response.data.token;
                if (token != null) {
                    console.log(`OneTap Data: ${token}`);
                    console.log("Navigating to screen with token:", token);
                    navigate(token);
                }
                break;
            }
            case "FALLBACK_TRIGGERED": {
                if (result.response.deliveryChannel != null) {
                    const newDeliveryChannel = result.response.deliveryChannel;
                    setTryingOnChannel(newDeliveryChannel);
                }
                break;
            }
            default: {
                console.warn(`Unknown response type: ${responseType}`);
                break;
            }
        }
    };

    const navigate = (token: string) => {
        console.log("Navigating to screen with token:", token);

        navigation.navigate('VerificationSuccessScreen', {
            token: token,
            phone: phoneNumber, // Using the destructured phone param
        });
    };

    useEffect(() => {
        headlessModule.setResponseCallback(onHeadlessResult);
        return () => {
            headlessModule.cleanup();
            headlessModule.clearListener();
        };
    }, []);

    const triggerOtpVerification = (otp: string) => {
        const request = {
            phone: phoneNumber,
            countryCode: '91',
            otp: otp,
        };
        headlessModule.start(request);
    };

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
                if (text.length === 6) {
                  triggerOtpVerification(text);
                }
              }}
              onComplete={undefined}
            />
          </View>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <Text style={styles.resendLabel}>Didn't get it?</Text>
          <TouchableOpacity 
            onPress={() => {
              setIsDelivered(false); // Reset delivery status when resending
              setTryingOnChannel("SMS"); // Update channel
              
              const request = {
                phone: phoneNumber,
                countryCode: "91",
                deliveryChannel: "SMS",
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
      // New styles for delivery status
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
