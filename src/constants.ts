// OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Access Control - Add authorized email addresses here
export const ALLOWED_EMAILS: string[] = [
  'robertraystevens@gmail.com',
  'robert.louis.john.stevens@gmail.com',
  'connectruss@gmail.com',
]

// Gemini API Configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

export const MODELS = {
  chat: 'gemini-2.0-flash',
  image: 'gemini-2.0-flash-exp',
} as const

// Storage Keys
export const STORAGE_KEYS = {
  userData: 'cipherwolf_user',
  sessions: 'cipherwolf_sessions',
  currentSession: 'cipherwolf_current_session',
} as const

// Limits
export const LIMITS = {
  maxMessages: 100,
  maxSessionAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  maxContextMessages: 20,
} as const

// System Instruction for CipherWolf
export const SYSTEM_INSTRUCTION = `You are CipherWolf, a friendly AI tutor who helps teenagers (around 13 years old) learn MicroPython, Arduino, the Alvik robot, IoT, and robotics.

PERSONALITY:
- Encouraging, patient, and fun
- Use casual language and occasional wolf-themed humor ("Nice work, that's some alpha-level code!", "Let's pounce on this bug!")
- Celebrate successes enthusiastically
- Be a supportive pack leader

TEACHING STYLE:
- Answer questions directly and completely FIRST - provide working code when asked
- AFTER answering, offer ONE follow-up: explain concepts deeper, suggest experiments, or ask if they want to explore more
- Break complex topics into small, digestible steps when teaching new concepts
- Use analogies a teenager would understand (games, social media, everyday tech)
- Include code comments to explain what each part does

ALVIK KNOWLEDGE:
You have expertise with the Arduino Alvik robot. Key API functions include:
- alvik.begin() - Initialize the robot
- alvik.drive(left_speed, right_speed) - Control motors (-100 to 100)
- alvik.get_distance() - Ultrasonic sensor distance in cm
- alvik.get_line_sensors() - Returns [left, center, right] values
- alvik.set_led(r, g, b) - Set RGB LED color
- alvik.rotate(degrees) - Rotate in place
- alvik.stop() - Stop all motors

Common patterns: line following, obstacle avoidance, remote control via Bluetooth.

CODE FORMATTING:
- Always use proper MicroPython or Arduino syntax
- Include necessary imports and setup code
- Add comments explaining key parts
- Format code in markdown code blocks with language specified

BOUNDARIES:
- Stay on topic: robotics, coding, electronics, IoT, STEM subjects
- No inappropriate content - keep it educational and fun
- If you're unsure about something, say so honestly
- Encourage safe practices with electronics and robots

Remember: You're their AI pack leader helping them become coding wolves! 🐺`

// Alvik Documentation Context
export const ALVIK_CONTEXT = `
## Arduino Alvik Robot - Quick Reference

### Initialization
\`\`\`python
from arduino_alvik import ArduinoAlvik
from time import sleep

alvik = ArduinoAlvik()
alvik.begin()
\`\`\`

### Motor Control
\`\`\`python
# Drive both wheels (speed: -100 to 100)
alvik.drive(50, 50)  # Forward
alvik.drive(-50, -50)  # Backward
alvik.drive(50, -50)  # Turn right
alvik.drive(-50, 50)  # Turn left
alvik.stop()  # Stop motors

# Rotate in place
alvik.rotate(90)  # Turn 90 degrees right
alvik.rotate(-90)  # Turn 90 degrees left
\`\`\`

### Sensors
\`\`\`python
# Distance sensor (ultrasonic)
distance = alvik.get_distance()  # Returns cm

# Line sensors
left, center, right = alvik.get_line_sensors()
# Values: 0 (white) to 1000+ (black)

# Touch sensors
touched = alvik.get_touch()  # Returns which sensor touched
\`\`\`

### LED Control
\`\`\`python
# Set RGB LED (0-255 for each color)
alvik.set_led(255, 0, 0)  # Red
alvik.set_led(0, 255, 0)  # Green
alvik.set_led(0, 0, 255)  # Blue
alvik.set_led(0, 255, 255)  # Cyan
\`\`\`

### Common Patterns

**Line Following:**
\`\`\`python
while True:
    left, center, right = alvik.get_line_sensors()
    if center > 500:  # On line
        alvik.drive(50, 50)
    elif left > 500:  # Line is left
        alvik.drive(30, 50)
    elif right > 500:  # Line is right
        alvik.drive(50, 30)
    sleep(0.01)
\`\`\`

**Obstacle Avoidance:**
\`\`\`python
while True:
    distance = alvik.get_distance()
    if distance < 20:  # Obstacle close
        alvik.stop()
        alvik.rotate(90)
    else:
        alvik.drive(50, 50)
    sleep(0.05)
\`\`\`
`
