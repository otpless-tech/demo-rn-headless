# OTPless React Native Headless Demo

This is a comprehensive demo project showcasing the integration of OTPless Headless SDK for React Native, styled with a Zepto-like UI. The OTPless SDK provides seamless authentication with multiple methods including Silent Network Authentication (SNA), OTP via SMS/WhatsApp, and more.

## Features

- 📱 Phone number authentication
- 🔊 Silent Network Authentication (SNA)
- 📲 OTP verification via SMS/WhatsApp
- 🔄 Fallback mechanism between authentication methods
- 🎨 Beautiful, production-ready UI
- 📚 Comprehensive code examples

## Demo Screenshots

The app provides a clean user experience with multiple screens:
- Phone number entry screen
- OTP verification screen
- Silent Network Authentication screen
- Success screen

## Getting Started

Follow these steps to integrate OTPless SDK into your React Native project.

### Prerequisites

- React Native 0.70.0 or later
- Node.js and npm/yarn
- iOS: Xcode 12 or later
- Android: Android Studio and SDK tools

### Installation

1. Clone this repository:
```bash
git clone https://github.com/otpless-tech/demo-rn-headless.git
cd demo-rn-headless
```

2. Install dependencies:
```bash
npm install
```

3. Install pods for iOS:
```bash
cd ios && pod install && cd ..
```

## SDK Integration Steps

### Step 1: Install OTPless SDK

Install the OTPless SDK dependency in your React Native project:

```bash
npm i otpless-headless-rn
```

### Step 2: Platform-specific Configurations

#### Android Setup

1. Add the following intent filter to your `android/app/src/main/AndroidManifest.xml` inside your main activity:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
      android:host="otpless"
      android:scheme= "otpless.YOUR_APP_ID_IN_LOWERCASE"/>
</intent-filter>
```

2. Add network security configuration (required for SNA feature):

```xml
android:networkSecurityConfig="@xml/otpless_network_security_config"
```

3. Set your activity's launchMode:

```xml
android:launchMode="singleTop"
android:exported="true"
```

#### iOS Setup

1. Add the URL schemes to your `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>otpless.YOUR_APP_ID_IN_LOWERCASE</string>
        </array>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>otpless</string>
    </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>whatsapp</string>
    <string>otpless</string>
    <string>gootpless</string>
    <string>com.otpless.ios.app.otpless</string>
    <string>googlegmail</string>
</array>
```

2. For SNA support, add to `Info.plist`:

```xml
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>80.in.safr.sekuramobile.com</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSTemporaryExceptionMinimumTLSVersion</key>
            <string>TLSv1.1</string>
        </dict>
        <key>partnerapi.jio.com</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSTemporaryExceptionMinimumTLSVersion</key>
            <string>TLSv1.1</string>
        </dict>
    </dict>
</dict>
```

3. Create `connector.swift` file and add the following code:

```swift
import OtplessSDK
import Foundation
class Connector: NSObject {
  @objc public static func loadUrl(_ url: NSURL) {
    Task(priority: .userInitiated) {
      await Otpless.shared.handleDeeplink(url as URL)
    }
  }

  @objc public static func isOtplessDeeplink(_ url: NSURL) -> Bool {
    return Otpless.shared.isOtplessDeeplink(url: url as URL)
  }
}
```

4. Update your `AppDelegate.mm` file:

```objc
#import "YourProjectName-Swift.h"

- (BOOL) application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  if([Connector isOtplessDeeplink:url]){
  [Connector loadUrl:url];
  return true;
}
  [super application:app openURL:url options:options];
  return true;
}
```

### Step 3: Initialize OTPless SDK

```typescript
import { OtplessHeadlessModule } from 'otpless-headless-rn';

// Create an instance
const headlessModule = new OtplessHeadlessModule();

// Initialize in useEffect
useEffect(() => {
  headlessModule.initialize("YOUR_APP_ID");
  headlessModule.setResponseCallback(onHeadlessResult);
  return () => {
    headlessModule.clearListener();
    headlessModule.cleanup();
  };
}, []);
```

### Step 4: Handle Callbacks

```typescript
const onHeadlessResult = (result: any) => {
  headlessModule.commitResponse(result);
  const responseType = result.responseType;

  switch (responseType) {
    case "SDK_READY":
      console.log("SDK is ready");
      break;
    case "INITIATE":
      // Handle authentication initiation
      if (result.statusCode == 200) {
        const authType = result.response.authType;
        if (authType === "OTP") {
          // Navigate to OTP verification screen
        } else if (authType === "SILENT_AUTH") {
          // Handle Silent Authentication
        }
      }
      break;
    case "VERIFY":
      // Handle verification response
      break;
    case "ONETAP":
      // Handle successful authentication
      const token = result.response.data.token;
      // Process token and proceed
      break;
    // ... other cases
  }
};
```

### Step 5: Start Authentication

```typescript
// For phone number auth
const startPhoneAuth = (phoneNumber: string, countryCode: string) => {
  const request = {
    phone: phoneNumber,
    countryCode
  };
  headlessModule.start(request);
};

// For OTP verification
const verifyOtp = (phoneNumber: string, countryCode: string, otp: string) => {
  const request = {
    phone: phoneNumber,
    countryCode,
    otp
  };
  headlessModule.start(request);
};
```

## Key Files

- **`App.tsx`** - Navigation setup
- **`zepto/PhoneNumberScreen.tsx`** - Phone number input and SDK initialization
- **`zepto/OtpVerificationScreen.tsx`** - OTP handling and verification
- **`shared_ui/VerifyingOverNetworkScreen.tsx`** - Silent Authentication UI

## Error Handling

See the files for comprehensive error handling for both Android and iOS platforms.

## Best Practices

- Always initialize the SDK in the appropriate component lifecycle
- Properly clean up listeners when unmounting components
- Handle all potential error states
- Provide feedback to users during authentication processes

## Support

For any issues or questions, please contact support@otpless.com or visit [OTPless Documentation](https://otpless.com/docs).

## License

This demo project is available for use as a reference implementation.
