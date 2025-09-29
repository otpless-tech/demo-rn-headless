import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';

// Import OTPless Headless SDK
import { OtplessHeadlessModule } from 'otpless-headless-rn';

// Create a global instance of OTPless Headless module that can be shared across screens
export const headlessModule = new OtplessHeadlessModule();

const PhoneNumberScreen = () => {
    // State to store the phone number entered by the user
    const [phoneNumber, setPhoneNumber] = useState('');

    // Use ref to keep track of latest phone number value for use in callbacks
    const phoneNumberRef = useRef('');

    // Update ref whenever phoneNumber state changes
    useEffect(() => {
        phoneNumberRef.current = phoneNumber;
    }, [phoneNumber]);

    // States for UI handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize OTPless SDK when component mounts
    useEffect(() => {
        // STEP 1: Initialize the SDK with your APP ID from OTPless dashboard
        headlessModule.initialize("YOUR_APP_ID")

        // STEP 2: Set the callback to handle responses from the SDK
        headlessModule.setResponseCallback(onHeadlessResult);

        // Clean up when component unmounts
        return () => {
            // Always clear listeners to prevent memory leaks
            headlessModule.clearListener();
            headlessModule.cleanup();
        };
    }, []);

    // STEP 3: Handle OTPless SDK responses
    const onHeadlessResult = (result: any) => {
        // Always commit the response first
        headlessModule.commitResponse(result);

        // Extract the response type to handle different scenarios
        const responseType = result.responseType;
        setLoading(false);

        switch (responseType) {
            case "SDK_READY": {
                // SDK is initialized and ready to use
                console.log("SDK is ready");
                break;
            }
            case "FAILED": {
                // SDK initialization failed
                console.log("SDK initialization failed");
                break;
            }
            case "INITIATE": {
                // Authentication initiation response
                if (result.statusCode == 200) {
                    console.log("Headless authentication initiated");

                    // Check which authentication type was selected by the SDK
                    const authType = result.response.authType;

                    if (authType === "OTP") {
                        // For OTP authentication, navigate to OTP verification screen
                        console.log("Phone number: ", phoneNumberRef.current);
                        console.log("Delivery channel: ", result.response.deliveryChannel);
                        navigation.navigate('OtpVerification', {
                            phoneNumber: phoneNumberRef.current,
                            deliveryChannel: result.response.deliveryChannel
                        });
                    } else if (authType === "SILENT_AUTH") {
                        // For Silent Authentication (SNA), navigate to network verification screen
                        navigation.navigate('NetworkVerificationScreen', {
                            backgroundColor: '#4B007D',
                            textColor: '#FFFFFF',
                            progressColor: '#FF5C5C',
                            message: 'Verifying via Silent Network Authentication...',
                            otplessModule: headlessModule,
                            phoneNumber: phoneNumberRef.current,
                        });
                    }
                } else {
                    // Handle initiation error
                    setError(result.response.errorMessage);
                }
                break;
            }
            case "OTP_AUTO_READ": {
                // Auto-read OTP from SMS or WhatsApp (Android only)
                if (Platform.OS === "android") {
                    const otp = result.response.otp;
                    console.log(`OTP Received: ${otp}`);
                }
                break;
            }
            case "VERIFY": {
                // Handle verification response
                if (result.response.authType == "SILENT_AUTH") {
                    if (result.statusCode == 9106) {
                        // SNA and all fallback methods failed
                        // Handle Terminal Senario by fallback to legacy auth
                    } else {
                        // SNA failed, but fallback methods might be available
                    }
                } else {
                    // Handle other verification scenarios
                }
                break;
            }
            case "DELIVERY_STATUS": {
                // Handle OTP delivery status updates
                const authType = result.response.authType;
                // Authentication type (OTP, MAGICLINK, OTP_LINK)

                const deliveryChannel = result.response.deliveryChannel;
                // Delivery channel (SMS, WHATSAPP, etc.)
                break;
            }
            case "ONETAP": {
                // OneTap authentication success
                console.log("OneTap response received");
                const token = result.response.data.token;
                if (token != null) {
                    // Navigate to success screen with token
                    navigation.navigate('VerificationSuccessScreen', {
                        token: token,
                        phone: phoneNumberRef.current,
                    })
                }
                break;
            }
            case "FALLBACK_TRIGGERED": {
                // Handle fallback scenarios (when primary delivery method fails)
                if (result.response.deliveryChannel != null) {
                    const newDeliveryChannel = result.response.deliveryChannel
                    // Update UI to show the new delivery channel
                }
                break;
            }
            default: {
                // Handle unknown response types
                console.warn(`Unknown response type: ${responseType}`);
                break;
            }
        }
    };

    // Navigation setup
    type PhoneNumberScreenNavigationProp = StackNavigationProp<
        RootStackParamList,
        'PhoneNumber'
    >;
    const navigation = useNavigation<PhoneNumberScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.logo}>zepto</Text>

                <Text style={styles.title}>Groceries{'\n'}delivered in{'\n'}10 minutes</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        keyboardType="number-pad"
                        onChangeText={(text) => {
                            setPhoneNumber(text);
                        }}
                        placeholder="Enter Phone Number"
                        placeholderTextColor="#999"
                    />
                </View>

                <LinearGradient
                    colors={['#FF5E62', '#FF9966']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}>
                    <TouchableOpacity
                        style={styles.buttonInner}
                        onPress={() => {
                            // STEP 4: Start authentication flow when user clicks continue
                            headlessModule.decimateAll();
                            if (phoneNumber.trim()) {
                                Keyboard.dismiss()

                                // Create request object with phone number and country code
                                const request = {
                                    phone: phoneNumber,
                                    countryCode: "91",
                                };

                                // Initiate authentication with OTPless
                                headlessModule.start(request);
                                setLoading(true);
                            }
                        }}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <Text style={styles.footerText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.linkText}>Terms of Use</Text> &{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>

                {/* Display error messages from OTPless */}
                {error.length > 0 && (
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                )}
            </View>

            {/* Loading indicator overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
        </View>
    );
};

// Styles for the UI components
const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(75, 0, 125, 0.7)', // Semi-transparent background
        zIndex: 1000, // Ensure it's above other elements
    },
    container: {
        flex: 1,
        backgroundColor: '#4B007D',
        paddingHorizontal: 20,
        // Remove justifyContent: 'center' to prevent content shifting
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center', // Center content within this container
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FF5C8D',
        marginBottom: 20,
        textTransform: 'lowercase',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 40,
        lineHeight: 36,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 25,
        height: 50,
    },
    countryCode: {
        fontSize: 16,
        color: '#000',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    button: {
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 30,
    },
    buttonInner: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footerText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 13,
    },
    errorText: {
        textAlign: 'center',
        color: '#FF5C5C',
        fontSize: 24,
        margin: 25
    },
    linkText: {
        color: '#FF5C8D',
        fontWeight: '500',
    },
});

export default PhoneNumberScreen;