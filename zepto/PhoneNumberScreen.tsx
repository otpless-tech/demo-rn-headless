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

import { OtplessHeadlessModule } from 'otpless-headless-rn';

export const headlessModule = new OtplessHeadlessModule();



const PhoneNumberScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState(''); // Pre-filled number

    const phoneNumberRef = useRef('');

    useEffect(() => {
        phoneNumberRef.current = phoneNumber;
    }, [phoneNumber]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        headlessModule.initialize("IMYDOEVY0N0ZG22FNTTI")
        headlessModule.setResponseCallback(onHeadlessResult);
        return () => {
            headlessModule.clearListener();
            headlessModule.cleanup();
        };
    }, []);


    const onHeadlessResult = (result: any) => {
        headlessModule.commitResponse(result);
        const responseType = result.responseType;
        setLoading(false);

        switch (responseType) {
            case "SDK_READY": {
                // Notify that SDK is ready
                console.log("SDK is ready");
                break;
            }
            case "FAILED": {
                console.log("SDK initialization failed");
                // Handle SDK initialization failure
                break;
            }
            case "INITIATE": {
                // Notify that headless authentication has been initiated
                if (result.statusCode == 200) {
                    console.log("Headless authentication initiated");
                    const authType = result.response.authType; // This is the authentication type
                    if (authType === "OTP") {
                        // Take user to OTP verification screen
                        console.log("Phoen number: ", phoneNumberRef.current);
                        console.log("Deliverey channelk;: ", result.response.deliveryChannel);
                        navigation.navigate('OtpVerification', { phoneNumber: phoneNumberRef.current, deliveryChannel: result.response.deliveryChannel });
                    } else if (authType === "SILENT_AUTH") {
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
                    setError(result.response.errorMessage);
                }
                break;
            }
            case "OTP_AUTO_READ": {
                // OTP_AUTO_READ is triggered only in Android devices for WhatsApp and SMS.
                if (Platform.OS === "android") {
                    const otp = result.response.otp;
                    console.log(`OTP Received: ${otp}`);
                }
                break;
            }
            case "VERIFY": {
                // notify that verification has failed.
                if (result.response.authType == "SILENT_AUTH") {
                    if (result.statusCode == 9106) {
                        // Silent Authentication and all fallback authentication methods in SmartAuth have failed.
                        //  The transaction cannot proceed further. 
                        // Handle the scenario to gracefully exit the authentication flow 
                    } else {
                        // Silent Authentication failed. 
                        // If SmartAuth is enabled, the INITIATE response 
                        // will include the next available authentication method configured in the dashboard.
                    }
                } else {

                }

                break;
            }
            case "DELIVERY_STATUS": {
                // This function is called when delivery is successful for your authType.
                const authType = result.response.authType;
                // It is the authentication type (OTP, MAGICLINK, OTP_LINK) for which the delivery status is being sent
                const deliveryChannel = result.response.deliveryChannel;
                // It is the delivery channel (SMS, WHATSAPP, etc) on which the authType has been delivered
                break;
            }

            case "ONETAP": {
                console.log("OneTap response received");
                const token = result.response.data.token;
                if (token != null) {
                    navigation.navigate('VerificationSuccessScreen', {
                        token: token,
                        phone: phoneNumberRef.current,
                    })
                }
                break;
            }
            case "FALLBACK_TRIGGERED": {
                // A fallback occurs when an OTP delivery attempt on one channel fails,  
                // and the system automatically retries via the subsequent channel selected on Otpless Dashboard.  
                // For example, if a merchant opts for SmartAuth with primary channal as WhatsApp and secondary channel as SMS,
                // in that case, if OTP delivery on WhatsApp fails, the system will automatically retry via SMS.
                // The response will contain the deliveryChannel to which the OTP has been sent.
                if (result.response.deliveryChannel != null) {
                    const newDeliveryChannel = result.response.deliveryChannel
                    // This is the deliveryChannel to which the OTP has been sent
                }
                break;
            }
            default: {
                console.warn(`Unknown response type: ${responseType}`);
                break;
            }
        }

    };


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
                            headlessModule.decimateAll();
                            if (phoneNumber.trim()) {
                                Keyboard.dismiss()
                                const request = {
                                    phone: phoneNumber,
                                    countryCode: "91",
                                };
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

                {error.length > 0 && (
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                )}
            </View>

            {/* Show loading indicator as an overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
        </View>
    );
};

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