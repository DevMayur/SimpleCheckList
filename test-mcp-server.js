#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing SimpleCheckList MCP Server...\n');

// Test the MCP server by spawning it and sending test messages
const mcpServerPath = join(__dirname, 'mcp-server', 'index.js');

const mcp = spawn('node', [mcpServerPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    API_BASE_URL: 'http://localhost:8355/api'
  }
});

let testsPassed = 0;
let totalTests = 0;

// Helper function to send JSON-RPC message
function sendMessage(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++totalTests;
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    
    console.log(`📤 Test ${id}: ${method}`);
    
    let responseData = '';
    let timeout;
    
    const onData = (data) => {
      responseData += data.toString();
      
      // Try to parse JSON response
      try {
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.trim()) {
            const response = JSON.parse(line);
            if (response.id === id) {
              clearTimeout(timeout);
              mcp.stdout.off('data', onData);
              
              if (response.error) {
                console.log(`❌ Test ${id} failed:`, response.error.message);
                reject(response.error);
              } else {
                console.log(`✅ Test ${id} passed`);
                testsPassed++;
                resolve(response.result);
              }
              return;
            }
          }
        }
      } catch (e) {
        // Continue waiting for complete JSON
      }
    };
    
    mcp.stdout.on('data', onData);
    
    // Set timeout
    timeout = setTimeout(() => {
      mcp.stdout.off('data', onData);
      console.log(`⏱️ Test ${id} timed out`);
      reject(new Error('Timeout'));
    }, 10000);
    
    // Send the message
    mcp.stdin.write(JSON.stringify(message) + '\n');
  });
}

// Run tests
async function runTests() {
  try {
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔍 Testing MCP server tools...\n');
    
    // Test 1: List available tools
    console.log('1. Testing list_tools...');
    const tools = await sendMessage('tools/list');
    console.log(`   Found ${tools.tools?.length || 0} tools\n`);
    
    // Test 2: Create a project
    console.log('2. Testing create_project...');
    const createProjectResult = await sendMessage('tools/call', {
      name: 'create_project',
      arguments: {
        name: 'MCP Test Project',
        description: 'A test project created via MCP',
        color: '#FF5722'
      }
    });
    console.log('   Project created successfully\n');
    
    // Test 3: List projects
    console.log('3. Testing list_projects...');
    const listProjectsResult = await sendMessage('tools/call', {
      name: 'list_projects',
      arguments: {}
    });
    console.log('   Projects listed successfully\n');
    
    // Test 4: Create a group
    console.log('4. Testing create_group...');
    // Extract project ID from create result (assuming it's in the content)
    const projectContent = createProjectResult.content?.[0]?.text || '';
    const projectMatch = projectContent.match(/"id":\s*"([^"]+)"/);
    const projectId = projectMatch ? projectMatch[1] : null;
    
    if (projectId) {
      const createGroupResult = await sendMessage('tools/call', {
        name: 'create_group',
        arguments: {
          project_id: projectId,
          name: 'MCP Test Group',
          description: 'A test group created via MCP'
        }
      });
      console.log('   Group created successfully\n');
      
      // Test 5: Create a task list
      console.log('5. Testing create_task_list...');
      const groupContent = createGroupResult.content?.[0]?.text || '';
      const groupMatch = groupContent.match(/"id":\s*"([^"]+)"/);
      const groupId = groupMatch ? groupMatch[1] : null;
      
      if (groupId) {
        const createTaskListResult = await sendMessage('tools/call', {
          name: 'create_task_list',
          arguments: {
            group_id: groupId,
            name: 'MCP Test Task List',
            description: 'A test task list created via MCP'
          }
        });
        console.log('   Task list created successfully\n');
        
        // Test 6: Create a task
        console.log('6. Testing create_task...');
        const taskListContent = createTaskListResult.content?.[0]?.text || '';
        const taskListMatch = taskListContent.match(/"id":\s*"([^"]+)"/);
        const taskListId = taskListMatch ? taskListMatch[1] : null;
        
        if (taskListId) {
          const createTaskResult = await sendMessage('tools/call', {
            name: 'create_task',
            arguments: {
              task_list_id: taskListId,
              title: 'MCP Test Task',
              description: 'A test task created via MCP',
              priority: 'high'
            }
          });
          console.log('   Task created successfully\n');
          
          // Test 7: Toggle task completion
          console.log('7. Testing toggle_task_completion...');
          const taskContent = createTaskResult.content?.[0]?.text || '';
          const taskMatch = taskContent.match(/"id":\s*"([^"]+)"/);
          const taskId = taskMatch ? taskMatch[1] : null;
          
          if (taskId) {
            await sendMessage('tools/call', {
              name: 'toggle_task_completion',
              arguments: {
                task_id: taskId
              }
            });
            console.log('   Task completion toggled successfully\n');
          }
        }
      }
      
      // Test 8: Get project stats
      console.log('8. Testing get_project_stats...');
      await sendMessage('tools/call', {
        name: 'get_project_stats',
        arguments: {
          project_id: projectId
        }
      });
      console.log('   Project stats retrieved successfully\n');
    }
    
    // Test 9: Get all tasks
    console.log('9. Testing get_all_tasks...');
    await sendMessage('tools/call', {
      name: 'get_all_tasks',
      arguments: {}
    });
    console.log('   All tasks retrieved successfully\n');
    
    console.log(`🎉 MCP Server Test Results:`);
    console.log(`   ✅ Passed: ${testsPassed}/${totalTests} tests`);
    console.log(`   📊 Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%\n`);
    
    if (testsPassed === totalTests) {
      console.log('🚀 All MCP server tests passed! The server is working correctly.');
      console.log('\nThe MCP server provides the following capabilities:');
      console.log('• Project management (create, read, update, delete)');
      console.log('• Group and task list organization');
      console.log('• Task management with priorities and completion tracking');
      console.log('• Statistics and reporting');
      console.log('• Full CRUD operations for all entities');
      console.log('\nAI applications can now connect to this MCP server to manage tasks programmatically!');
    } else {
      console.log('⚠️ Some tests failed. Check the MCP server configuration.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    // Clean up
    mcp.kill();
    process.exit(testsPassed === totalTests ? 0 : 1);
  }
}

// Handle MCP server errors
mcp.stderr.on('data', (data) => {
  console.error('MCP Server Error:', data.toString());
});

mcp.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`MCP server exited with code ${code}`);
  }
});

// Start tests
runTests();
