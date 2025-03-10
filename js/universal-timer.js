/**
 * Universal Timer - Synchronized countdown across all devices
 * This script fetches the countdown end time from a server endpoint
 * and ensures all users see the same countdown regardless of when they load the page.
 */

class UniversalTimer {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      endpointUrl: '/api/timer-endpoint.php', // Server endpoint to get/set timer
      onTick: null,                           // Callback on each tick
      onComplete: null,                       // Callback when timer completes
      updateInterval: 1000,                   // Update interval in ms
      ...options
    };
    
    this.endTime = null;
    this.timer = null;
    this.isInitialized = false;
    this.lastServerSync = 0;
    this.serverTimeDiff = 0;  // Difference between server and client time
  }
  
  // Initialize the timer
  async init() {
    if (this.isInitialized) return;
    
    try {
      // Get the end time from server
      await this.syncWithServer();
      
      // Start the timer
      this.start();
      this.isInitialized = true;
      
      // Sync with server every 5 minutes to handle drift
      setInterval(() => this.syncWithServer(), 5 * 60 * 1000);
    } catch (error) {
      console.error('Failed to initialize timer:', error);
      // Fallback to localStorage if server sync fails
      this.fallbackToLocalStorage();
    }
  }
  
  // Sync with the server to get the official end time
  async syncWithServer() {
    try {
      const response = await fetch(this.config.endpointUrl);
      if (!response.ok) throw new Error('Server response not OK');
      
      const data = await response.json();
      
      // Store the end time
      this.endTime = new Date(data.endTime);
      
      // Calculate server-client time difference to account for clock differences
      const serverTime = new Date(data.serverTime);
      const clientTime = new Date();
      this.serverTimeDiff = serverTime - clientTime;
      
      this.lastServerSync = Date.now();
      
      return true;
    } catch (error) {
      console.error('Error syncing with server:', error);
      throw error;
    }
  }
  
  // Fallback to localStorage if server is unavailable
  fallbackToLocalStorage() {
    console.log('Falling back to localStorage for timer');
    const storedEndTime = localStorage.getItem('universalTimerEndTime');
    
    if (storedEndTime) {
      this.endTime = new Date(parseInt(storedEndTime));
    } else {
      // Default: 15 minutes from now
      this.endTime = new Date();
      this.endTime.setMinutes(this.endTime.getMinutes() + 15);
      localStorage.setItem('universalTimerEndTime', this.endTime.getTime().toString());
    }
    
    this.start();
    this.isInitialized = true;
  }
  
  // Start the timer
  start() {
    if (this.timer) clearInterval(this.timer);
    
    // Update immediately
    this.update();
    
    // Then set interval
    this.timer = setInterval(() => this.update(), this.config.updateInterval);
  }
  
  // Stop the timer
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  // Update the timer
  update() {
    // Get current time adjusted for server-client difference
    const now = new Date(Date.now() + this.serverTimeDiff);
    const distance = this.endTime - now;
    
    // Calculate time components
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Format time components
    const timeData = {
      days: days < 10 ? `0${days}` : `${days}`,
      hours: hours < 10 ? `0${hours}` : `${hours}`,
      minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
      seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
      distance,
      completed: distance <= 0
    };
    
    // Call the tick callback
    if (typeof this.config.onTick === 'function') {
      this.config.onTick(timeData);
    }
    
    // If the countdown is finished
    if (distance <= 0) {
      this.stop();
      localStorage.removeItem('universalTimerEndTime');
      
      // Call the complete callback
      if (typeof this.config.onComplete === 'function') {
        this.config.onComplete();
      }
    }
  }
} 