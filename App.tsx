import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import PhoneNumberScreen from './zepto/PhoneNumberScreen';
import OtpVerificationScreen from './zepto/OtpVerificationScreen';
import VerificationCompleteScreen from './zepto/VerificationSuccessScreen';
import  NetworkVerificationScreen from './shared_ui/VerifyingOverNetworkScreen';
import { OtplessHeadlessModule } from 'otpless-headless-rn';

export type RootStackParamList = {
  PhoneNumber: undefined;
  OtpVerification: { phoneNumber: string, deliveryChannel: string };
  VerificationSuccessScreen: { token: string; phone: string };
  NetworkVerificationScreen: {
    backgroundColor: string,
    textColor: string,
    progressColor: string,
    message : string,
    otplessModule: OtplessHeadlessModule,
    phoneNumber: string
  }
};

const Stack = createStackNavigator<RootStackParamList>();

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
        <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerificationScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromRightAndroid,
          }}
        />
        <Stack.Screen
          name="VerificationSuccessScreen"
          component={VerificationCompleteScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromRightAndroid,
          }}
        />
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
