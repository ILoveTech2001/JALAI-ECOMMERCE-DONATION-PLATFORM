// Test script for log limiter functionality
import { limitedConsole, globalLogLimiter } from './logLimiter.js';

export const testLogLimiter = () => {
  console.log('🧪 Testing Log Limiter...');
  
  // Test 1: Normal logging should work for first few messages
  console.log('Test 1: Normal logging');
  for (let i = 1; i <= 3; i++) {
    limitedConsole.log(`Test message ${i}`);
  }
  
  // Test 2: Excessive logging should be limited
  console.log('Test 2: Excessive logging (should be limited after 5 messages)');
  for (let i = 1; i <= 10; i++) {
    limitedConsole.log('Repeated message that should be limited');
  }
  
  // Test 3: Different message types
  console.log('Test 3: Different log levels');
  limitedConsole.warn('Warning message');
  limitedConsole.error('Error message');
  limitedConsole.info('Info message');
  
  // Test 4: Show stats
  console.log('Test 4: Log limiter stats');
  const stats = globalLogLimiter.getStats();
  console.log('📊 Stats:', stats);
  
  console.log('✅ Log limiter test complete');
};

// Auto-run test if in development mode
if (import.meta.env.DEV && localStorage.getItem('debugAPI') === 'true') {
  setTimeout(testLogLimiter, 1000);
}
