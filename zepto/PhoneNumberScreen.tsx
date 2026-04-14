import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';

// Import OTPless Headless SDK
import { OtplessHeadlessModule } from 'otpless-headless-rn';
import { useOtplessResult } from '../hooks/useOtplessResult';

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

    // Navigation setup
    type PhoneNumberScreenNavigationProp = StackNavigationProp<
        RootStackParamList,
        'PhoneNumber'
    >;
    const navigation = useNavigation<PhoneNumberScreenNavigationProp>();

    useOtplessResult({
        otplessModule: headlessModule,
        phoneNumber: phoneNumberRef.current,
        setError,
        onInitiateSuccess: (authType, response) => {
            if (authType === 'OTP') {
                navigation.navigate('OtpVerification', {
                    phoneNumber: phoneNumberRef.current,
                    deliveryChannel: response.deliveryChannel,
                });
            } else if (authType === 'SILENT_AUTH') {
                navigation.navigate('NetworkVerificationScreen', {
                    backgroundColor: '#4B007D',
                    textColor: '#FFFFFF',
                    progressColor: '#FF5C5C',
                    message: 'Verifying via Silent Network Authentication...',
                    otplessModule: headlessModule,
                    phoneNumber: phoneNumberRef.current,
                });
            }
        },
        onResponse: () => setLoading(false),
        onError: () => setLoading(false),
    });

    // Initialize OTPless SDK when component mounts
    useEffect(() => {
        headlessModule.initialize("0D9AIJ86AX0DTUAO9919");
        return () => {
            headlessModule.clearListener();
            headlessModule.cleanup();
        };
    }, []);

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