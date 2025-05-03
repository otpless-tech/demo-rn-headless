import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import PhoneNumberScreen from './zepto/PhoneNumberScreen';
import OtpVerificationScreen from './zepto/OtpVerificationScreen';
import VerificationCompleteScreen from './zepto/VerificationSuccessScreen';
import  NetworkVerificationScreen from './shared_ui/VerifyingOverNetworkScreen';
import { OtplessHeadlessModule } from 'otpless-headless-rn';

// Define the types for the navigation stack parameters
export type RootStackParamList = {
  // Phone number input screen - entry point of the app
  PhoneNumber: undefined;
  
  // OTP verification screen - receives phone number and delivery channel
  OtpVerification: { phoneNumber: string, deliveryChannel: string };
  
  // Success screen shown after successful verification
  VerificationSuccessScreen: { token: string; phone: string };
  
  // Screen for Silent Network Authentication flow
  NetworkVerificationScreen: {
    backgroundColor: string,
    textColor: string,
    progressColor: string,
    message : string,
    otplessModule: OtplessHeadlessModule,
    phoneNumber: string
  }
};

// Create the navigation stack
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Main App component
 * 
 * Sets up the navigation flow for the OTPless authentication demo:
 * 1. PhoneNumber screen - User enters phone number
 * 2. Based on OTPless SDK response:
 *    a. OtpVerification screen - For OTP-based verification
 *    b. NetworkVerificationScreen - For Silent Network Authentication
 * 3. VerificationSuccessScreen - After successful authentication
 */
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PhoneNumber"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // slide in/out default
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
          },
        }}>
        {/* Phone number input screen - Starting point */}
        <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
        
        {/* OTP verification screen - For OTP-based authentication */}
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerificationScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromRightAndroid,
          }}
        />
        
        {/* Success screen - Shown after successful verification */}
        <Stack.Screen
          name="VerificationSuccessScreen"
          component={VerificationCompleteScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromRightAndroid,
          }}
        />
        
        {/* Silent Network Authentication screen */}
         <Stack.Screen
          name="NetworkVerificationScreen"
          component={NetworkVerificationScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromRightAndroid,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
