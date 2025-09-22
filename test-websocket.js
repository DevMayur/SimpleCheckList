#!/usr/bin/env node

/**
 * WebSocket Implementation Test Script
 * 
 * This script tests the WebSocket real-time functionality by:
 * 1. Connecting to the WebSocket server
 * 2. Joining a test project room
 * 3. Listening for events
 * 4. Making API calls to trigger events
 * 5. Verifying events are received
 */

const { io } = require('socket.io-client');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8355/api';
const WS_URL = 'http://localhost:8355';

class WebSocketTester {
  constructor() {
    this.socket = null;
    this.receivedEvents = [];
    this.testProjectId = null;
  }

  async connect() {
    console.log('🔌 Connecting to WebSocket server...');
    
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server:', this.socket.id);
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });
  }

  setupEventListeners() {
    const events = [
      'project-created', 'project-updated', 'project-deleted',
      'group-created', 'group-updated', 'group-deleted',
      'task-list-created', 'task-list-updated', 'task-list-deleted',
      'task-created', 'task-updated', 'task-toggled', 'task-deleted',
      'subtask-created', 'subtask-toggled', 'subtask-deleted'
    ];

    events.forEach(event => {
      this.socket.on(event, (data) => {
        console.log(`📨 Received event: ${event}`, data);
        this.receivedEvents.push({ event, data, timestamp: Date.now() });
      });
    });
  }

  async createTestProject() {
    console.log('📋 Creating test project...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, {
        name: 'WebSocket Test Project',
        description: 'Test project for WebSocket functionality',
        color: '#FF5722'
      });
      
      this.testProjectId = response.data.id;
      console.log('✅ Test project created:', this.testProjectId);
      
      // Join the project room
      this.socket.emit('join-project', this.testProjectId);
      console.log('🏠 Joined project room');
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create test project:', error.message);
      throw error;
    }
  }

  async createTestGroup() {
    console.log('📁 Creating test group...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/projects/${this.testProjectId}/groups`, {
        name: 'Test Group',
        description: 'Test group for WebSocket functionality'
      });
      
      console.log('✅ Test group created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create test group:', error.message);
      throw error;
    }
  }

  async createTestTaskList(groupId) {
    console.log('📝 Creating test task list...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/task-lists`, {
        name: 'Test Task List',
        description: 'Test task list for WebSocket functionality'
      });
      
      console.log('✅ Test task list created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create test task list:', error.message);
      throw error;
    }
  }

  async createTestTask(taskListId) {
    console.log('✅ Creating test task...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/task-lists/${taskListId}/tasks`, {
        title: 'Test Task',
        description: 'Test task for WebSocket functionality',
        priority: 'high'
      });
      
      console.log('✅ Test task created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create test task:', error.message);
      throw error;
    }
  }

  async toggleTestTask(taskId) {
    console.log('🔄 Toggling test task...');
    
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/toggle`);
      console.log('✅ Test task toggled');
    } catch (error) {
      console.error('❌ Failed to toggle test task:', error.message);
      throw error;
    }
  }

  async cleanup() {
    if (this.testProjectId) {
      console.log('🧹 Cleaning up test project...');
      try {
        await axios.delete(`${API_BASE_URL}/projects/${this.testProjectId}`);
        console.log('✅ Test project cleaned up');
      } catch (error) {
        console.error('❌ Failed to cleanup test project:', error.message);
      }
    }

    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Disconnected from WebSocket server');
    }
  }

  async runTest() {
    try {
      // Connect to WebSocket
      await this.connect();
      
      // Wait a bit for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create test entities and verify events
      const project = await this.createTestProject();
      await this.waitForEvent('project-created', 2000);
      
      const group = await this.createTestGroup();
      await this.waitForEvent('group-created', 2000);
      
      const taskList = await this.createTestTaskList(group.id);
      await this.waitForEvent('task-list-created', 2000);
      
      const task = await this.createTestTask(taskList.id);
      await this.waitForEvent('task-created', 2000);
      
      await this.toggleTestTask(task.id);
      await this.waitForEvent('task-toggled', 2000);
      
      // Generate test report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  async waitForEvent(eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkForEvent = () => {
        const event = this.receivedEvents.find(e => e.event === eventName && e.timestamp > startTime);
        if (event) {
          console.log(`✅ Event received: ${eventName}`);
          resolve(event);
        } else if (Date.now() - startTime > timeout) {
          console.error(`❌ Timeout waiting for event: ${eventName}`);
          reject(new Error(`Timeout waiting for event: ${eventName}`));
        } else {
          setTimeout(checkForEvent, 100);
        }
      };
      
      checkForEvent();
    });
  }

  generateReport() {
    console.log('\n📊 WebSocket Test Report');
    console.log('========================');
    console.log(`Total events received: ${this.receivedEvents.length}`);
    
    const eventCounts = {};
    this.receivedEvents.forEach(({ event }) => {
      eventCounts[event] = (eventCounts[event] || 0) + 1;
    });
    
    console.log('\nEvent breakdown:');
    Object.entries(eventCounts).forEach(([event, count]) => {
      console.log(`  ${event}: ${count}`);
    });
    
    console.log('\n🎉 WebSocket implementation is working correctly!');
    console.log('\nFeatures verified:');
    console.log('  ✅ WebSocket connection established');
    console.log('  ✅ Project room management');
    console.log('  ✅ Real-time event emission');
    console.log('  ✅ Event reception and handling');
    console.log('  ✅ API integration with WebSocket events');
  }
}

// Run the test
async function main() {
  console.log('🧪 Starting WebSocket Implementation Test\n');
  
  const tester = new WebSocketTester();
  await tester.runTest();
  
  console.log('\n✅ All tests passed! WebSocket implementation is ready.');
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the test if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = WebSocketTester;
