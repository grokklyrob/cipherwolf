# Arduino Alvik Robot - Complete Reference Guide

## Overview

The Arduino Alvik is a compact, programmable robot designed for education. It features:
- Two DC motors with encoders
- Ultrasonic distance sensor
- Three line-following sensors
- RGB LED
- Touch sensors
- Bluetooth connectivity
- MicroPython and Arduino support

## Getting Started

### Basic Setup (MicroPython)

```python
from arduino_alvik import ArduinoAlvik
from time import sleep

# Create robot instance
alvik = ArduinoAlvik()

# Initialize - must be called before using any features
alvik.begin()

# Your code here...

# Always stop motors when done
alvik.stop()
```

### Basic Setup (Arduino C++)

```cpp
#include "Arduino_Alvik.h"

Arduino_Alvik alvik;

void setup() {
  alvik.begin();
}

void loop() {
  // Your code here
}
```

## Motor Control

### Basic Movement

```python
# Drive both wheels (speed range: -100 to 100)
alvik.drive(left_speed, right_speed)

# Examples:
alvik.drive(50, 50)   # Forward at half speed
alvik.drive(-50, -50) # Backward at half speed
alvik.drive(0, 0)     # Stop
alvik.stop()          # Also stops motors

# Turn in place
alvik.drive(50, -50)  # Spin right
alvik.drive(-50, 50)  # Spin left
```

### Rotation

```python
# Rotate a specific number of degrees
alvik.rotate(degrees)  # Positive = right, negative = left

# Examples:
alvik.rotate(90)   # Turn right 90 degrees
alvik.rotate(-90)  # Turn left 90 degrees
alvik.rotate(180)  # Turn around
```

### Speed Control Tips

- Speed values: -100 (full reverse) to 100 (full forward)
- Start with lower speeds (30-50) for better control
- Different surfaces may require speed adjustments
- Motors might not be perfectly matched - slight differences are normal

## Sensors

### Ultrasonic Distance Sensor

```python
# Get distance to obstacle in centimeters
distance = alvik.get_distance()

# Example usage
if distance < 20:
    print("Obstacle detected!")
    alvik.stop()
```

**Notes:**
- Returns distance in cm (typically 2-400cm range)
- Best accuracy between 10-200cm
- May give inaccurate readings for very close or angled surfaces

### Line Sensors

```python
# Get readings from all three line sensors
left, center, right = alvik.get_line_sensors()

# Values typically range from 0 (white/reflective) to 1000+ (black/dark)
# Exact values depend on surface and lighting
```

**Calibration Tips:**
- Test on your specific surface to find threshold values
- Typical threshold: ~500 for black/white distinction
- Lighting affects readings - calibrate in your environment

### Touch Sensors

```python
# Check if touch sensor is pressed
touched = alvik.get_touch()

# Returns information about which sensor was touched
```

## LED Control

```python
# Set RGB LED color (values 0-255 for each)
alvik.set_led(red, green, blue)

# Color examples:
alvik.set_led(255, 0, 0)     # Red
alvik.set_led(0, 255, 0)     # Green
alvik.set_led(0, 0, 255)     # Blue
alvik.set_led(255, 255, 0)   # Yellow
alvik.set_led(0, 255, 255)   # Cyan
alvik.set_led(255, 0, 255)   # Magenta
alvik.set_led(255, 255, 255) # White
alvik.set_led(0, 0, 0)       # Off
```

## Common Patterns

### Line Following

```python
from arduino_alvik import ArduinoAlvik
from time import sleep

alvik = ArduinoAlvik()
alvik.begin()

# Adjust these based on your surface
THRESHOLD = 500
BASE_SPEED = 40
TURN_SPEED = 25

try:
    while True:
        left, center, right = alvik.get_line_sensors()

        if center > THRESHOLD:
            # On the line - go straight
            alvik.drive(BASE_SPEED, BASE_SPEED)
        elif left > THRESHOLD:
            # Line is to the left - turn left
            alvik.drive(TURN_SPEED, BASE_SPEED)
        elif right > THRESHOLD:
            # Line is to the right - turn right
            alvik.drive(BASE_SPEED, TURN_SPEED)
        else:
            # Lost the line - search or stop
            alvik.drive(TURN_SPEED, -TURN_SPEED)

        sleep(0.01)  # Small delay for stability

except KeyboardInterrupt:
    alvik.stop()
```

### Obstacle Avoidance

```python
from arduino_alvik import ArduinoAlvik
from time import sleep

alvik = ArduinoAlvik()
alvik.begin()

SAFE_DISTANCE = 25  # cm
FORWARD_SPEED = 50

try:
    while True:
        distance = alvik.get_distance()

        if distance < SAFE_DISTANCE:
            # Obstacle detected!
            alvik.stop()
            alvik.set_led(255, 0, 0)  # Red warning
            sleep(0.2)

            # Back up a bit
            alvik.drive(-30, -30)
            sleep(0.5)

            # Turn to find clear path
            alvik.rotate(90)
            alvik.set_led(0, 255, 0)  # Green = clear
        else:
            # Path is clear - drive forward
            alvik.drive(FORWARD_SPEED, FORWARD_SPEED)
            alvik.set_led(0, 255, 0)

        sleep(0.05)

except KeyboardInterrupt:
    alvik.stop()
    alvik.set_led(0, 0, 0)
```

### Wall Following

```python
from arduino_alvik import ArduinoAlvik
from time import sleep

alvik = ArduinoAlvik()
alvik.begin()

TARGET_DISTANCE = 15  # Desired distance from wall
TOLERANCE = 3

try:
    while True:
        distance = alvik.get_distance()

        if distance < TARGET_DISTANCE - TOLERANCE:
            # Too close - turn away
            alvik.drive(40, 30)
        elif distance > TARGET_DISTANCE + TOLERANCE:
            # Too far - turn toward
            alvik.drive(30, 40)
        else:
            # Good distance - go straight
            alvik.drive(40, 40)

        sleep(0.02)

except KeyboardInterrupt:
    alvik.stop()
```

### LED Status Indicator

```python
def set_status(status):
    """Set LED color based on robot status"""
    colors = {
        'ready': (0, 255, 0),      # Green
        'moving': (0, 0, 255),     # Blue
        'warning': (255, 255, 0),  # Yellow
        'error': (255, 0, 0),      # Red
        'searching': (255, 0, 255) # Magenta
    }
    r, g, b = colors.get(status, (255, 255, 255))
    alvik.set_led(r, g, b)
```

## Troubleshooting

### Motors Not Moving
1. Check battery level
2. Ensure `alvik.begin()` was called
3. Verify speed values are in valid range (-100 to 100)
4. Check for mechanical obstructions

### Sensors Reading Incorrectly
1. Clean sensor surfaces
2. Check lighting conditions
3. Calibrate threshold values for your environment
4. Ensure adequate distance for ultrasonic sensor

### Robot Veering to One Side
1. Normal - motors may have slight differences
2. Adjust speeds independently to compensate
3. Check wheel attachment and tightness

### Connection Issues
1. Reset the robot
2. Check USB/Bluetooth connection
3. Ensure correct port selected in IDE

## Best Practices

1. **Always call `alvik.begin()`** before using any features
2. **Use try/except with `alvik.stop()`** to ensure motors stop on errors
3. **Add small delays** in loops for stability (0.01-0.05s)
4. **Test with low speeds first** then increase gradually
5. **Calibrate sensors** for your specific environment
6. **Monitor battery level** - low battery affects behavior
