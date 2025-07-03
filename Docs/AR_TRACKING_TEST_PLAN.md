# AR Tracking Stability Test Plan

## Overview
This document provides a comprehensive testing plan for evaluating the AR tracking stability improvements implemented in the ARBrochure project. The testing focuses on comparing different stability modes and measuring real-world performance.

## Test Environment Setup

### Prerequisites
1. **Physical Setup**:
   - Printed copy of the AR target image (`packages/frontend/public/assets/mindar/examples/card.png`)
   - Mobile device with camera (iOS Safari or Android Chrome)
   - Good lighting conditions
   - Stable surface to place the target image

2. **Development Server**:
   - Server running at `http://localhost:3000`
   - Access from mobile device on same network

### Accessing the Test Environment
1. Start development server: `pnpm dev --filter frontend`
2. Find your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. On mobile device, navigate to: `http://[YOUR_IP]:3000`
4. Grant camera permissions when prompted

## Test Scenarios

### 1. Baseline Stability Test

**Objective**: Establish baseline performance for each stability mode

**Steps**:
1. Select "**Stable**" mode in the control panel
2. Point camera at printed target image
3. Wait for green "Tracking" status
4. Hold device as steady as possible for 30 seconds
5. Record metrics:
   - Movement Velocity (should be low)
   - Jittering indicator (should be "No")
   - Smoothing Factor (should be ~0.3)
   - Frame Rate (should be >25 FPS)
6. Repeat for "**Responsive**" and "**Ultra-Stable**" modes

**Expected Results**:
- **Responsive**: Lower smoothing, faster response, may show more jitter
- **Stable**: Balanced performance 
- **Ultra-Stable**: Highest smoothing, most stable, potential slight lag

### 2. Hand Tremor Simulation Test

**Objective**: Test effectiveness of jitter reduction

**Steps**:
1. Select "**Hand Tremor Test**" scenario
2. Start with "**Responsive**" mode
3. Point at target and establish tracking
4. Simulate natural hand tremor (small, rapid movements)
5. Observe:
   - 3D model stability
   - "Jittering" indicator turning to "Yes"
   - Movement Velocity increasing
6. Switch to "**Ultra-Stable**" mode during tracking
7. Compare visual stability improvement

**Metrics to Monitor**:
- Visual jitter reduction in 3D model
- Movement Velocity changes
- Jitter detection accuracy
- Real-time smoothing factor adaptation

### 3. Intentional Movement Test

**Objective**: Verify responsiveness during intentional camera movement

**Steps**:
1. Select "**Intentional Movement**" scenario
2. Start tracking with "**Ultra-Stable**" mode
3. Make deliberate, slow movements:
   - Left/right panning
   - Up/down tilting
   - Closer/farther distance changes
4. Verify 3D model follows smoothly but promptly
5. Switch to "**Responsive**" mode
6. Repeat movements and compare response time

**Expected Results**:
- Large movements should overcome smoothing
- Adaptive smoothing should reduce for intentional movement
- No significant lag in responsive mode
- Gradual, smooth following in ultra-stable mode

### 4. Tracking Loss Recovery Test

**Objective**: Test stabilizer reset and reacquisition performance

**Steps**:
1. Establish stable tracking
2. Cover target image with hand for 3 seconds
3. Uncover and observe reacquisition time
4. Check that tracking metrics reset properly
5. Verify stability after reacquisition

**Key Metrics**:
- Time to reacquire tracking
- Stability after reacquisition
- Proper metric reset (history length should reset to 0)

### 5. Environmental Stress Test

**Objective**: Test performance under challenging conditions

**Test Conditions**:
1. **Low Light**: Dim lighting conditions
2. **High Movement**: Walking while tracking
3. **Angle Variations**: Extreme viewing angles
4. **Distance Variations**: Very close/far positioning

**Steps for Each Condition**:
1. Test all three stability modes
2. Record performance degradation
3. Note when tracking is lost
4. Measure recovery time

## Performance Benchmarks

### Success Criteria

| Metric | Responsive Mode | Stable Mode | Ultra-Stable Mode |
|--------|----------------|-------------|-------------------|
| Jitter Reduction | >30% vs. no stabilization | >60% vs. no stabilization | >80% vs. no stabilization |
| Response Latency | <100ms | <200ms | <300ms |
| Tracking Persistence | >70% uptime | >85% uptime | >90% uptime |
| Frame Rate | >25 FPS | >25 FPS | >25 FPS |

### Key Observations to Record

1. **Visual Stability**:
   - Is the 3D model position steady during hand tremor?
   - How much does the model "float" or jump?
   - Is the improvement noticeable between modes?

2. **Responsiveness**:
   - Does the model follow intentional movements promptly?
   - Is there noticeable lag in ultra-stable mode?
   - How quickly does adaptive smoothing kick in?

3. **Tracking Robustness**:
   - How often does tracking get lost?
   - How quickly does it reacquire?
   - Does the stabilizer help maintain tracking in borderline conditions?

## Real-World Testing Checklist

### Before Starting
- [ ] Print AR target image clearly
- [ ] Ensure good lighting (avoid direct sunlight/shadows)
- [ ] Clear browser cache if experiencing issues
- [ ] Close other browser tabs for better performance

### During Testing
- [ ] Monitor real-time metrics continuously
- [ ] Take notes on subjective experience
- [ ] Test on multiple devices if available
- [ ] Compare against baseline (no stabilization)

### After Testing
- [ ] Document any crashes or errors
- [ ] Note performance on different devices
- [ ] Record optimal stability mode for different use cases
- [ ] Identify any edge cases or failure modes

## Debugging Tools

### Browser Console
- Open developer tools (F12)
- Check console for errors
- Monitor network requests
- Check for performance warnings

### Real-Time Metrics Panel
- Movement Velocity: Higher = more movement detected
- History Length: Number of poses in smoothing buffer
- Jittering: Real-time jitter detection
- Smoothing Factor: Current adaptive smoothing level
- Frame Rate: Performance indicator

### Activity Log
- Tracks mode changes
- Records tracking events
- Shows stabilizer resets
- Timestamps all activities

## Expected Issues and Solutions

### Common Problems
1. **"Camera not accessible"**: Grant camera permissions
2. **"Target not detected"**: Improve lighting, clean target image
3. **Poor performance**: Close other apps, use newer device
4. **Tracking jumpy**: Try ultra-stable mode, check target image quality

### Performance Optimization
1. **Low Frame Rate**: 
   - Close browser tabs
   - Reduce device temperature
   - Switch to responsive mode

2. **Frequent Tracking Loss**:
   - Improve lighting
   - Keep target image flat and clean
   - Maintain appropriate distance (30-50cm)

## Test Results Template

```
Device: _______________
Browser: ______________
Test Date: ____________

Baseline Test Results:
- Responsive Mode: Jitter ___%, FPS ___
- Stable Mode: Jitter ___%, FPS ___
- Ultra-Stable Mode: Jitter ___%, FPS ___

Hand Tremor Test:
- Visual Improvement: ___/10
- Jitter Detection Accuracy: ___/10
- Mode Switching Effectiveness: ___/10

Intentional Movement Test:
- Responsiveness: ___/10
- Smoothness: ___/10
- Lag Perception: ___/10

Overall Stability Improvement: ___/10
Recommended Mode for General Use: ___________
```

## Next Steps After Testing
1. Document findings in PROGRESS_SUMMARY.md
2. Identify optimal default stability mode
3. Note any parameter tuning needed
4. Plan production deployment strategy
5. Consider user preference settings

---

**Happy Testing! 🚀**

*The goal is to validate that our tracking stability improvements significantly enhance the user experience while maintaining responsive performance.* 