import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  Add,
  Delete,
} from '@mui/icons-material';
import { tasksApi, subtasksApi } from '../services/api';
import { TaskWithDetails, Subtask } from '../types';

const TaskDetail: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSubtaskDialog, setOpenSubtaskDialog] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ title: '' });

  useEffect(() => {
    if (taskId) {
      loadTaskData();
    }
  }, [taskId]);

  const loadTaskData = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      // For now, we'll need to get the task from the all tasks endpoint
      // In a real app, you'd have a specific endpoint for getting a single task
      const allTasks = await tasksApi.getAll();
      const taskData = allTasks.find(t => t.id === taskId);
      
      if (taskData) {
        setTask(taskData);
        const subtasksData = await subtasksApi.getByTask(taskId);
        setSubtasks(subtasksData);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      setError('Failed to load task data');
      console.error('Error loading task data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async () => {
    if (!task) return;

    try {
      await tasksApi.toggleCompletion(task.id);
      setTask({ ...task, is_completed: !task.is_completed });
    } catch (err) {
      setError('Failed to toggle task');
      console.error('Error toggling task:', err);
    }
  };

  const handleCreateSubtask = async () => {
    if (!task) return;

    try {
      const subtask = await subtasksApi.create(task.id, newSubtask);
      setSubtasks([...subtasks, subtask]);
      setOpenSubtaskDialog(false);
      setNewSubtask({ title: '' });
    } catch (err) {
      setError('Failed to create subtask');
      console.error('Error creating subtask:', err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await subtasksApi.toggleCompletion(subtaskId);
      setSubtasks(subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, is_completed: !subtask.is_completed } : subtask
      ));
    } catch (err) {
      setError('Failed to toggle subtask');
      console.error('Error toggling subtask:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await subtasksApi.delete(subtaskId);
      setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
    } catch (err) {
      setError('Failed to delete subtask');
      console.error('Error deleting subtask:', err);
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

  if (!task) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Task not found
        </Typography>
        <Button onClick={() => navigate(`/project/${projectId}`)} sx={{ mt: 2 }}>
          Back to Project
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(`/project/${projectId}`)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="600">
          Task Details
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Checkbox
              checked={task.is_completed}
              onChange={handleToggleTask}
              icon={<RadioButtonUnchecked />}
              checkedIcon={<CheckCircle />}
              sx={{ mr: 1 }}
            />
            <Typography
              variant="h5"
              component="h2"
              sx={{
                textDecoration: task.is_completed ? 'line-through' : 'none',
                opacity: task.is_completed ? 0.6 : 1,
                flexGrow: 1,
              }}
            >
              {task.title}
            </Typography>
            <Chip
              label={task.priority}
              color={getPriorityColor(task.priority)}
              size="small"
            />
          </Box>

          {task.description && (
            <Typography variant="body1" color="text.secondary" mb={2}>
              {task.description}
            </Typography>
          )}

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            <Chip
              label={`Project: ${task.project_name}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Group: ${task.group_name}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`List: ${task.task_list_name}`}
              size="small"
              variant="outlined"
            />
          </Box>

          {task.due_date && (
            <Typography variant="body2" color="text.secondary">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Subtasks
            </Typography>
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setOpenSubtaskDialog(true)}
            >
              Add Subtask
            </Button>
          </Box>

          <List>
            {subtasks.map((subtask) => (
              <ListItem key={subtask.id} sx={{ px: 0 }}>
                <Checkbox
                  checked={subtask.is_completed}
                  onChange={() => handleToggleSubtask(subtask.id)}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
                <ListItemText
                  primary={subtask.title}
                  sx={{
                    textDecoration: subtask.is_completed ? 'line-through' : 'none',
                    opacity: subtask.is_completed ? 0.6 : 1,
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {subtasks.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No subtasks yet"
                  secondary="Click 'Add Subtask' to create one"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Create Subtask Dialog */}
      <Dialog open={openSubtaskDialog} onClose={() => setOpenSubtaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Subtask</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subtask Title"
            fullWidth
            variant="outlined"
            value={newSubtask.title}
            onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubtaskDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSubtask}
            variant="contained"
            disabled={!newSubtask.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail;
