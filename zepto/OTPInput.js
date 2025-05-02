import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Dimensions } from 'react-native';

const OTPInput = ({ onChangeText, value, onComplete }) => {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  
  const otpLength = 6;
  
  useEffect(() => {
    // Auto-trigger completion callback when OTP is fully entered
    if (value && value.length === otpLength && onComplete) {
      onComplete(value);
    }
  }, [value, onComplete]);

  // Generate array of digits from the current value
  const renderDigits = () => {
    const valueArray = value.split('');
    const digits = Array(otpLength).fill('');
    
    // Fill in entered digits
    valueArray.forEach((digit, index) => {
      if (index < otpLength) {
        digits[index] = digit;
      }
    });
    
    return digits;
  };

  // Handle tapping on the container to focus the input
  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container} onTouchStart={handlePress}>
      {/* Hidden input field that captures the OTP */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        maxLength={otpLength}
        style={styles.hiddenInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      
      {/* OTP display boxes */}
      <View style={styles.boxesContainer}>
        {Array(otpLength).fill(0).map((_, index) => {
          const isFilled = index < value.length;
          const isCurrentBox = index === value.length;
          const showCursor = focused && isCurrentBox;
          
          return (
            <View 
              key={index} 
              style={[
                styles.box, 
                isFilled && styles.filledBox,
                showCursor && styles.focusedBox
              ]}
            >
              {isFilled && (
                <Text style={styles.digit}>{renderDigits()[index]}</Text>
              )}
              {showCursor && <View style={styles.cursor} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const BOX_SIZE = width / 8; // Adjust based on screen size

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxesContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#666',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledBox: {
    backgroundColor: '#4CAF50', // Green background for filled boxes
    borderColor: '#4CAF50',
  },
  focusedBox: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  digit: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: BOX_SIZE / 2,
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
});

export default OTPInput;