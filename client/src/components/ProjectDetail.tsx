import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Fab,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  ArrowBack,
} from '@mui/icons-material';
import { projectsApi, groupsApi, taskListsApi, tasksApi } from '../services/api';
import { Project, Group, TaskList, Task } from '../types';
import { useProjectWebSocket } from '../hooks/useWebSocket';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [taskLists, setTaskLists] = useState<Record<string, TaskList[]>>({});
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openTaskListDialog, setOpenTaskListDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [newTaskList, setNewTaskList] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState<{ title: string; description: string; priority: 'low' | 'medium' | 'high' }>({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // WebSocket event handlers
  const handleGroupCreated = useCallback((group: Group) => {
    if (group.project_id === projectId) {
      setGroups(prev => [...prev, group]);
    }
  }, [projectId]);

  const handleGroupUpdated = useCallback((group: Group) => {
    setGroups(prev => prev.map(g => g.id === group.id ? group : g));
  }, []);

  const handleGroupDeleted = useCallback((data: { id: string }) => {
    setGroups(prev => prev.filter(g => g.id !== data.id));
    // Also clean up related task lists and tasks
    setTaskLists(prev => {
      const { [data.id]: deleted, ...rest } = prev;
      return rest;
    });
    setTasks(prev => {
      const updatedTasks = { ...prev };
      Object.keys(prev).forEach(taskListId => {
        const taskList = Object.values(taskLists).flat().find(tl => tl.id === taskListId);
        if (taskList && taskList.group_id === data.id) {
          delete updatedTasks[taskListId];
        }
      });
      return updatedTasks;
    });
  }, [taskLists]);

  const handleTaskListCreated = useCallback((taskList: TaskList) => {
    setTaskLists(prev => ({
      ...prev,
      [taskList.group_id]: [...(prev[taskList.group_id] || []), taskList]
    }));
  }, []);

  const handleTaskListUpdated = useCallback((taskList: TaskList) => {
    setTaskLists(prev => ({
      ...prev,
      [taskList.group_id]: prev[taskList.group_id]?.map(tl => 
        tl.id === taskList.id ? taskList : tl
      ) || []
    }));
  }, []);

  const handleTaskListDeleted = useCallback((data: { id: string }) => {
    setTaskLists(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(groupId => {
        updated[groupId] = updated[groupId].filter(tl => tl.id !== data.id);
      });
      return updated;
    });
    // Clean up related tasks
    setTasks(prev => {
      const { [data.id]: deleted, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleTaskCreated = useCallback((task: Task) => {
    setTasks(prev => ({
      ...prev,
      [task.task_list_id]: [...(prev[task.task_list_id] || []), task]
    }));
  }, []);

  const handleTaskUpdated = useCallback((task: Task) => {
    setTasks(prev => ({
      ...prev,
      [task.task_list_id]: prev[task.task_list_id]?.map(t => 
        t.id === task.id ? task : t
      ) || []
    }));
  }, []);

  const handleTaskToggled = useCallback((task: Task) => {
    setTasks(prev => ({
      ...prev,
      [task.task_list_id]: prev[task.task_list_id]?.map(t => 
        t.id === task.id ? task : t
      ) || []
    }));
  }, []);

  const handleTaskDeleted = useCallback((data: { id: string }) => {
    setTasks(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(taskListId => {
        updated[taskListId] = updated[taskListId].filter(t => t.id !== data.id);
      });
      return updated;
    });
  }, []);

  // Set up WebSocket connection and event listeners for this project
  useProjectWebSocket(projectId || null, {
    onGroupCreated: handleGroupCreated,
    onGroupUpdated: handleGroupUpdated,
    onGroupDeleted: handleGroupDeleted,
    onTaskListCreated: handleTaskListCreated,
    onTaskListUpdated: handleTaskListUpdated,
    onTaskListDeleted: handleTaskListDeleted,
    onTaskCreated: handleTaskCreated,
    onTaskUpdated: handleTaskUpdated,
    onTaskToggled: handleTaskToggled,
    onTaskDeleted: handleTaskDeleted,
  });

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectData, groupsData] = await Promise.all([
        projectsApi.getById(projectId),
        groupsApi.getByProject(projectId),
      ]);

      setProject(projectData);
      setGroups(groupsData);

      // Load task lists for each group
      const taskListsPromises = groupsData.map(group =>
        taskListsApi.getByGroup(group.id).then(taskLists => ({ groupId: group.id, taskLists }))
      );
      const taskListsResults = await Promise.all(taskListsPromises);
      
      const taskListsMap: Record<string, TaskList[]> = {};
      taskListsResults.forEach(({ groupId, taskLists }) => {
        taskListsMap[groupId] = taskLists;
      });
      setTaskLists(taskListsMap);

      // Load tasks for each task list
      const allTaskLists = Object.values(taskListsMap).flat();
      const tasksPromises = allTaskLists.map(taskList =>
        tasksApi.getByTaskList(taskList.id).then(tasks => ({ taskListId: taskList.id, tasks }))
      );
      const tasksResults = await Promise.all(tasksPromises);
      
      const tasksMap: Record<string, Task[]> = {};
      tasksResults.forEach(({ taskListId, tasks }) => {
        tasksMap[taskListId] = tasks;
      });
      setTasks(tasksMap);

    } catch (err) {
      setError('Failed to load project data');
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!projectId) return;

    try {
      const group = await groupsApi.create(projectId, newGroup);
      setGroups([...groups, group]);
      setOpenGroupDialog(false);
      setNewGroup({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create group');
      console.error('Error creating group:', err);
    }
  };

  const handleCreateTaskList = async () => {
    if (!selectedGroupId) return;

    try {
      const taskList = await taskListsApi.create(selectedGroupId, newTaskList);
      setTaskLists({
        ...taskLists,
        [selectedGroupId]: [...(taskLists[selectedGroupId] || []), taskList],
      });
      setOpenTaskListDialog(false);
      setNewTaskList({ name: '', description: '' });
      setSelectedGroupId(null);
    } catch (err) {
      setError('Failed to create task list');
      console.error('Error creating task list:', err);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedTaskListId) return;

    try {
      const task = await tasksApi.create(selectedTaskListId, newTask);
      setTasks({
        ...tasks,
        [selectedTaskListId]: [...(tasks[selectedTaskListId] || []), task],
      });
      setOpenTaskDialog(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setSelectedTaskListId(null);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (taskId: string, taskListId: string) => {
    try {
      await tasksApi.toggleCompletion(taskId);
      setTasks(prev => ({
        ...prev,
        [taskListId]: prev[taskListId]?.map(task =>
          task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
        ) || [],
      }));
    } catch (err) {
      setError('Failed to toggle task');
      console.error('Error toggling task:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Project not found
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: project.color,
            mr: 1,
          }}
        />
        <Typography variant="h4" component="h1" fontWeight="600">
          {project.name}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={3}>
        {project.description || 'No description'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} md={6} key={group.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600">
                    {group.name}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setOpenTaskListDialog(true);
                    }}
                  >
                    Add List
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {group.description || 'No description'}
                </Typography>

                {taskLists[group.id]?.map((taskList) => (
                  <Accordion key={taskList.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Typography variant="subtitle1" fontWeight="500">
                          {taskList.name}
                        </Typography>
                        <Chip
                          label={`${tasks[taskList.id]?.length || 0} tasks`}
                          size="small"
                          sx={{ ml: 'auto', mr: 1 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {tasks[taskList.id]?.map((task) => (
                          <ListItem key={task.id} sx={{ px: 0 }}>
                            <Checkbox
                              checked={task.is_completed}
                              onChange={() => handleToggleTask(task.id, taskList.id)}
                              icon={<RadioButtonUnchecked />}
                              checkedIcon={<CheckCircle />}
                            />
                            <ListItemText
                              primary={task.title}
                              secondary={task.description}
                              sx={{
                                textDecoration: task.is_completed ? 'line-through' : 'none',
                                opacity: task.is_completed ? 0.6 : 1,
                              }}
                            />
                            <ListItemSecondaryAction>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={task.priority}
                                  size="small"
                                  color={getPriorityColor(task.priority)}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedTaskListId(taskList.id);
                                    setOpenTaskDialog(true);
                                  }}
                                >
                                  <Add />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                        {(!tasks[taskList.id] || tasks[taskList.id].length === 0) && (
                          <ListItem>
                            <ListItemText
                              primary="No tasks yet"
                              secondary="Click the + button to add a task"
                              sx={{ textAlign: 'center', color: 'text.secondary' }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {(!taskLists[group.id] || taskLists[group.id].length === 0) && (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      No task lists yet
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setOpenTaskListDialog(true);
                      }}
                    >
                      Create First List
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {groups.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No groups yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first group to organize your tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenGroupDialog(true)}
          >
            Create Group
          </Button>
        </Box>
      )}

      {/* Create Group Dialog */}
      <Dialog open={openGroupDialog} onClose={() => setOpenGroupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={!newGroup.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Task List Dialog */}
      <Dialog open={openTaskListDialog} onClose={() => setOpenTaskListDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task List Name"
            fullWidth
            variant="outlined"
            value={newTaskList.name}
            onChange={(e) => setNewTaskList({ ...newTaskList, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTaskList.description}
            onChange={(e) => setNewTaskList({ ...newTaskList, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskListDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTaskList}
            variant="contained"
            disabled={!newTaskList.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Priority"
            fullWidth
            select
            SelectProps={{ native: true }}
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTask}
            variant="contained"
            disabled={!newTask.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenGroupDialog(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default ProjectDetail;
