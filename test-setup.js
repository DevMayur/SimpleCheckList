const axios = require('axios');

const API_BASE_URL = 'http://localhost:8355/api';

async function testSetup() {
  console.log('Testing SimpleCheckList setup...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test projects endpoint
    console.log('\n2. Testing projects endpoint...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`);
    console.log('✅ Projects endpoint working, found', projectsResponse.data.length, 'projects');

    // Test creating a project
    console.log('\n3. Testing project creation...');
    const newProject = {
      name: 'Test Project',
      description: 'This is a test project created by the setup test',
      color: '#FF6B6B'
    };
    const createResponse = await axios.post(`${API_BASE_URL}/projects`, newProject);
    console.log('✅ Project created successfully:', createResponse.data.name);

    const projectId = createResponse.data.id;

    // Test creating a group
    console.log('\n4. Testing group creation...');
    const newGroup = {
      name: 'Test Group',
      description: 'This is a test group'
    };
    const groupResponse = await axios.post(`${API_BASE_URL}/projects/${projectId}/groups`, newGroup);
    console.log('✅ Group created successfully:', groupResponse.data.name);

    const groupId = groupResponse.data.id;

    // Test creating a task list
    console.log('\n5. Testing task list creation...');
    const newTaskList = {
      name: 'Test Task List',
      description: 'This is a test task list'
    };
    const taskListResponse = await axios.post(`${API_BASE_URL}/groups/${groupId}/task-lists`, newTaskList);
    console.log('✅ Task list created successfully:', taskListResponse.data.name);

    const taskListId = taskListResponse.data.id;

    // Test creating a task
    console.log('\n6. Testing task creation...');
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      priority: 'high'
    };
    const taskResponse = await axios.post(`${API_BASE_URL}/task-lists/${taskListId}/tasks`, newTask);
    console.log('✅ Task created successfully:', taskResponse.data.title);

    const taskId = taskResponse.data.id;

    // Test toggling task completion
    console.log('\n7. Testing task completion toggle...');
    await axios.patch(`${API_BASE_URL}/tasks/${taskId}/toggle`);
    console.log('✅ Task completion toggled successfully');

    // Test project stats
    console.log('\n8. Testing project statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/projects/${projectId}/stats`);
    console.log('✅ Project stats retrieved:', statsResponse.data);

    // Clean up test data
    console.log('\n9. Cleaning up test data...');
    await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
    console.log('✅ Test project deleted');

    console.log('\n🎉 All tests passed! SimpleCheckList is working correctly.');
    console.log('\nYou can now:');
    console.log('- Access the frontend at: http://localhost:8354');
    console.log('- Use the API at: http://localhost:8355/api');
    console.log('- Connect AI applications to the MCP server');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testSetup();
