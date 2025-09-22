import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add, Folder, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { Project, ProjectStats } from '../types';
import { useWebSocketEvents } from '../hooks/useWebSocket';
import ConnectionStatus from './ConnectionStatus';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#3B82F6' });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  // WebSocket event handlers
  const handleProjectCreated = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
    // Load stats for the new project
    projectsApi.getStats(project.id).then(stats => {
      setProjectStats(prev => ({ ...prev, [project.id]: stats }));
    }).catch(() => {
      // Ignore stats loading errors for new projects
    });
  }, []);

  const handleProjectUpdated = useCallback((project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    // Refresh stats for updated project
    projectsApi.getStats(project.id).then(stats => {
      setProjectStats(prev => ({ ...prev, [project.id]: stats }));
    }).catch(() => {
      // Ignore stats loading errors
    });
  }, []);

  const handleProjectDeleted = useCallback((data: { id: string }) => {
    setProjects(prev => prev.filter(p => p.id !== data.id));
    setProjectStats(prev => {
      const { [data.id]: deleted, ...rest } = prev;
      return rest;
    });
  }, []);

  // Set up WebSocket event listeners
  useWebSocketEvents({
    onProjectCreated: handleProjectCreated,
    onProjectUpdated: handleProjectUpdated,
    onProjectDeleted: handleProjectDeleted,
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsApi.getAll();
      setProjects(projectsData);

      // Load stats for each project
      const statsPromises = projectsData.map(project => 
        projectsApi.getStats(project.id).catch(() => null)
      );
      const statsResults = await Promise.all(statsPromises);
      
      const statsMap: Record<string, ProjectStats> = {};
      statsResults.forEach((stats, index) => {
        if (stats) {
          statsMap[projectsData[index].id] = stats;
        }
      });
      setProjectStats(statsMap);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const project = await projectsApi.create(newProject);
      setProjects([...projects, project]);
      setOpenDialog(false);
      setNewProject({ name: '', description: '', color: '#3B82F6' });
      loadProjects(); // Reload to get stats
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    }
  };

  const getCompletionPercentage = (stats: ProjectStats | undefined) => {
    if (!stats || stats.total_tasks === 0) return 0;
    return Math.round((stats.completed_tasks / stats.total_tasks) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="600">
          Projects
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <ConnectionStatus showInline />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            New Project
          </Button>
        </Box>
      </Box>
      
      <ConnectionStatus showSnackbar />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {projects.map((project) => {
          const stats = projectStats[project.id];
          const completionPercentage = getCompletionPercentage(stats);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
                  },
                }}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: project.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h6" component="h2" fontWeight="600">
                      {project.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: '40px' }}
                  >
                    {project.description || 'No description'}
                  </Typography>

                  {stats && (
                    <Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CheckCircle sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {stats.completed_tasks} of {stats.total_tasks} tasks completed
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 6,
                            backgroundColor: '#E5E7EB',
                            borderRadius: 3,
                            overflow: 'hidden',
                            mr: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${completionPercentage}%`,
                              height: '100%',
                              backgroundColor: project.color,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          {completionPercentage}%
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          label={`${stats.total_groups} groups`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${stats.total_task_lists} lists`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${stats.total_subtasks} subtasks`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {projects.length === 0 && (
        <Box textAlign="center" py={8}>
          <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={2}>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first project to get started with organizing your tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Project
          </Button>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Color"
            fullWidth
            variant="outlined"
            value={newProject.color}
            onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
            type="color"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProject.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
