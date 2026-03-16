import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from './types'; 
import {
  Container, Typography, TextField, Button, List, ListItem,
  ListItemText, ListItemIcon, Checkbox, IconButton, Paper,
  Stack, Alert, LinearProgress, Box, Fade, Grow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const API_URL = "https://week04-task01.vercel.app/api/tasks";

const dreamyTheme = {
  mainBg: 'linear-gradient(45deg, #f3e5f5 0%, #fce4ec 30%, #e1bee7 70%, #f8bbd0 100%)',
  cardBg: 'rgba(255, 255, 255, 0.4)',
  accentPurple: '#9c27b0',
  accentPink: '#e91e63',
  lilacText: '#6a1b9a',
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Task[]>(API_URL);
      setTasks(res.data);
      setError(null);
    } catch (err) { setError("Backend disconnected! Check server."); }
    finally { setTimeout(() => setLoading(false), 800); }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Please enter a magic task title!");
      return;
    }
    try {
      const res = await axios.post<Task>(API_URL, { title: newTitle });
      setTasks([...tasks, res.data]);
      setNewTitle("");
      setError(null);
    } catch (err) { setError("Failed to add task."); }
  };

  const toggleTask = async (id: string, isCompleted: boolean) => {
    try {
      const res = await axios.put<Task>(`${API_URL}/${id}`, { isCompleted: !isCompleted });
      setTasks(tasks.map(t => t.id === id ? res.data : t));
    } catch (err) { setError("Update failed."); }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) { setError("Delete failed."); }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: { xs: 4, md: 8 },
      px: { xs: 2, sm: 0 }, 
      background: dreamyTheme.mainBg 
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper sx={{ 
            p: { xs: 3, md: 4 }, // Padding responsive
            borderRadius: { xs: 6, md: 10 }, 
            bgcolor: dreamyTheme.cardBg, 
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            
            {/* Header Section */}
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
              <AutoAwesomeIcon sx={{ color: dreamyTheme.accentPink, fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h4" fontWeight="900" sx={{ 
                color: dreamyTheme.lilacText,
                fontSize: { xs: '1.8rem', md: '2.125rem' } 
              }}>
                DreamTask
              </Typography>
            </Stack>

            {error && <Alert severity="warning" sx={{ mb: 2, borderRadius: 5 }} onClose={() => setError(null)}>{error}</Alert>}

            {/* Stats Section - Mobile vertical,horizontal */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mb: 4 }}
            >
              <StatBox title="Tasks" value={tasks.length} color={dreamyTheme.accentPurple} />
              <StatBox title="Completed" value={completedCount} color={dreamyTheme.accentPink} />
              <StatBox title="Pending" value={tasks.length - completedCount} color="#f06292" />
            </Stack>

            {/* Input Form */}
            <form onSubmit={addTask}>
              <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
                <TextField 
                  fullWidth 
                  label="Add a task..." 
                  variant="outlined"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 5,
                      bgcolor: 'rgba(255,255,255,0.3)',
                                    } 
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ 
                    borderRadius: 5, 
                    minWidth: '60px',
                    background: dreamyTheme.accentPurple,
                    '&:hover': { background: dreamyTheme.accentPink }
                  }}
                >
                  <AddCircleIcon />
                </Button>
              </Stack>
            </form>

            {loading && <LinearProgress sx={{ mb: 3, borderRadius: 5 }} />}

            {/* Tasks List */}
            <List sx={{ maxHeight: { xs: 300, md: 350 }, overflow: 'auto' }}>
              {tasks.length === 0 && !loading && (
                <Typography align="center" sx={{ color: '#aaa', fontStyle: 'italic', mt: 2 }}>
                  No tasks yet. Add some magic!
                </Typography>
              )}
              {tasks.map((task, index) => (
                <Grow in key={task.id} timeout={(index + 1) * 200}>
                  <Paper elevation={0} sx={{ 
                    mb: 1.5, 
                    borderRadius: 4, 
                    bgcolor: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.3)' 
                  }}>
                    <ListItem secondaryAction={
                      <IconButton edge="end" onClick={() => deleteTask(task.id)} sx={{ color: '#ff80ab' }}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Checkbox 
                          checked={task.isCompleted} 
                          onChange={() => toggleTask(task.id, task.isCompleted)} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.title} 
                        sx={{ 
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          color: task.isCompleted ? '#999' : '#333'
                        }} 
                      />
                    </ListItem>
                  </Paper>
                </Grow>
              ))}
            </List>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

const StatBox = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <Box sx={{ 
    flex: 1, 
    p: 2, 
    borderRadius: 5, 
    textAlign: 'center', 
    bgcolor: 'rgba(255,255,255,0.6)', 
    border: `1px solid ${color}22`,
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
  }}>
    <Typography variant="caption" sx={{ color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</Typography>
    <Typography variant="h5" sx={{ color: color, fontWeight: '900' }}>{value}</Typography>
  </Box>
);

export default App;