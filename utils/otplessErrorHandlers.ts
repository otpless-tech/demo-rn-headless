/**
 * Handles INITIATE response errors from the OTPless SDK.
 * Logs the error to the console and returns a user-friendly message for UI display.
 */
export function handleInitiateError(response: any): string {
  const errorCode = response?.errorCode as string;
  const errorMessage = response?.errorMessage as string;

  if (!errorCode) {
    console.log('OTPless Initiate Error: Unknown error -', errorMessage);
    return errorMessage ?? 'Something went wrong. Please try again.';
  }

  let uiMessage: string;

  switch (errorCode) {
    case '7101':
      uiMessage = 'Invalid or missing parameters.';
      break;
    case '7102':
      uiMessage = 'Invalid phone number.';
      break;
    case '7103':
      uiMessage = 'Invalid delivery channel for phone number.';
      break;
    case '7104':
      uiMessage = 'Invalid email address.';
      break;
    case '7105':
      uiMessage = 'Invalid delivery channel for email.';
      break;
    case '7106':
      uiMessage = 'Invalid phone number or email.';
      break;
    case '7113':
      uiMessage = 'Request expired. Please try again.';
      break;
    case '7116':
      uiMessage = 'Invalid OTP length. Only 4 or 6 digits are allowed.';
      break;
    case '7121':
      uiMessage = 'Invalid app configuration.';
      break;
    case '4000':
      uiMessage = 'Invalid request. Please try again.';
      break;
    case '4003':
      uiMessage = 'Incorrect request channel.';
      break;
    case '401':
    case '7025':
      uiMessage = 'Unauthorized request. Please check your app configuration.';
      break;
    case '7020':
    case '7022':
    case '7023':
    case '7024':
      uiMessage = 'Too many requests. Please wait and try again.';
      break;
    case '9100':
    case '9101':
    case '9102':
    case '9103':
    case '9104':
    case '9105':
    case '9110':
      uiMessage = 'Network error. Please check your connection.';
      break;
    default:
      uiMessage = errorMessage ?? 'Something went wrong. Please try again.';
  }

  console.log(`OTPless Initiate Error [${errorCode}]: ${errorMessage}`);
  return uiMessage;
}

/**
 * Handles VERIFY response errors from the OTPless SDK.
 * Logs the error to the console and returns a user-friendly message for UI display.
 */
export function handleVerifyError(response: any): string {
  const errorCode = response?.errorCode as string;
  const errorMessage = response?.errorMessage as string;

  if (!errorCode) {
    console.log('OTPless Verify Error: Unknown error -', errorMessage);
    return errorMessage ?? 'Verification failed. Please try again.';
  }

  let uiMessage: string;
  switch (errorCode) {
    case "7112":
        uiMessage = "Empty OTP. Please try again";
        break;
    case "7115":
        uiMessage = "OTP is already verified. Please try again";
        break;
    case "7118":
        uiMessage = 'Incorrect OTP. Please try again.';
        break;
    case "7303":
    case '7114':
        uiMessage = 'OTP expired. Please resend the OTP';
        break;
    case "4000":
        uiMessage = `OTPless Error: ${errorMessage ?? "Unknown error"}`;
        break;

    // Internet-related errors
    case "9100":
    case "9101":
    case "9102":
    case "9103":
    case "9104":
    case "9105":
    case "9110":
        uiMessage = `OTPless Error: Network error (Connectivity issue) - ${errorMessage}`
        break;
    default:
        uiMessage = `OTPless Error: ${errorMessage ?? "Unknown error"}`;
  }


  console.log(`OTPless Verify Error [${errorCode}]: ${errorMessage}`);
  return uiMessage;
}
