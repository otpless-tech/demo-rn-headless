// hooks/useOtplessResult.ts
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { handleInitiateError, handleVerifyError } from '../utils/otplessErrorHandlers';

export interface UseOtplessResultOptions {
  otplessModule: any;
  phoneNumber: string;
  setError: (msg: string) => void;
  /** Called when INITIATE statusCode 200 — screen handles navigation */
  onInitiateSuccess: (authType: string, response: any) => void;
  /** Called for OTP_AUTO_READ on Android */
  onOtpAutoRead?: (otp: string) => void;
  /** Called when DELIVERY_STATUS fires */
  onDeliveryStatus?: (authType: string, deliveryChannel: string) => void;
  /** Called when FALLBACK_TRIGGERED fires with the new delivery channel */
  onFallback?: (deliveryChannel: string) => void;
  /** Called whenever any error occurs (INITIATE fail, VERIFY fail, SNA exhausted) */
  onError?: () => void;
  /** Called on every SDK response — use for clearing loading spinners */
  onResponse?: () => void;
}

export function useOtplessResult(options: UseOtplessResultOptions): void {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Keep a ref to the latest options so the registered handler never
  // becomes stale without needing to re-register.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Keep phone number in a separate ref so ONETAP always reads the latest value.
  const phoneRef = useRef(options.phoneNumber);
  useEffect(() => {
    phoneRef.current = options.phoneNumber;
  }, [options.phoneNumber]);

  useEffect(() => {
    const onHeadlessResult = (result: any) => {
      const {
        otplessModule,
        setError,
        onInitiateSuccess,
        onOtpAutoRead,
        onDeliveryStatus,
        onFallback,
        onError,
        onResponse,
      } = optionsRef.current;

      otplessModule.commitResponse(result);
      onResponse?.();

      const responseType = result.responseType;

      switch (responseType) {
        case 'SDK_READY':
          console.log('SDK is ready');
          break;

        case 'FAILED':
          console.log('SDK initialization failed');
          break;

        case 'INITIATE':
          if (result.statusCode === 200) {
            console.log('Headless authentication initiated');
            onInitiateSuccess(result.response.authType, result.response);
          } else {
            setError(handleInitiateError(result.response));
            onError?.();
          }
          break;

        case 'OTP_AUTO_READ':
          if (Platform.OS === 'android') {
            const otp = result.response.otp;
            console.log(`OTP Received: ${otp}`);
            onOtpAutoRead?.(otp);
          }
          break;

        case 'VERIFY':
          if (result.response.authType === 'SILENT_AUTH') {
            if (result.statusCode === 9106) {
              // SNA and all fallback methods exhausted — exit auth flow
              setError('Verification failed. Please try again.');
              onError?.();
            }
            // else: SmartAuth fallback will trigger a new INITIATE event
          } else {
            setError(handleVerifyError(result.response));
            onError?.();
          }
          break;

        case 'DELIVERY_STATUS':
          onDeliveryStatus?.(result.response.authType, result.response.deliveryChannel);
          break;

        case 'ONETAP': {
          const token = result.response.data.token;
          const idToken = result.response.data.idToken;
          if (token != null) {
            console.log(`OneTap token: ${token}`);
            navigation.navigate('VerificationSuccessScreen', {
              token,
              idToken: idToken ?? '',
              phone: phoneRef.current,
            });
          }
          break;
        }

        case 'FALLBACK_TRIGGERED':
          if (result.response.deliveryChannel != null) {
            console.log('Fallback triggered:', result.response.deliveryChannel);
            onFallback?.(result.response.deliveryChannel);
          }
          break;

        default:
          console.warn(`Unknown response type: ${responseType}`);
          break;
      }
    };

    optionsRef.current.otplessModule.setResponseCallback(onHeadlessResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Register once on mount; latest values always read via optionsRef
}
