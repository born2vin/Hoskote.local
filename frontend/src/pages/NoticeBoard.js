import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { noticesApi } from '../services/api';
import PageHeader from '../components/PageHeader';

const toDateInputValue = (isoString) => {
  if (!isoString) return '';
  return isoString.slice(0, 10);
};

const NoticeBoard = () => {
  const [open, setOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', expiry_date: '' },
  });

  const { data: notices, isLoading } = useQuery('all-notices', () => noticesApi.getAll());

  const invalidate = () => {
    queryClient.invalidateQueries('all-notices');
    queryClient.invalidateQueries('active-notices');
  };

  const createMutation = useMutation(noticesApi.create, {
    onSuccess: () => {
      invalidate();
      handleClose();
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => noticesApi.update(id, data),
    {
      onSuccess: () => {
        invalidate();
        handleClose();
      },
    }
  );

  const deleteMutation = useMutation(noticesApi.delete, {
    onSuccess: () => invalidate(),
  });

  const handleOpenCreate = () => {
    setEditingNotice(null);
    reset({ title: '', description: '', expiry_date: '' });
    setOpen(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingNotice(notice);
    reset({
      title: notice.title,
      description: notice.description,
      expiry_date: toDateInputValue(notice.expiry_date),
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingNotice(null);
    reset();
  };

  const onSubmit = (data) => {
    if (editingNotice) {
      updateMutation.mutate({ id: editingNotice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this notice? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const isExpired = (notice) => new Date(notice.expiry_date).getTime() <= Date.now();

  const noticeList = notices?.data || [];
  const saving = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', py: 3 }}>
      <Container maxWidth="lg">
        <PageHeader
          icon="📣"
          title="Notice Board"
          subtitle="Publish notices for the scrolling banner residents see on the Dashboard"
          action={
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
              New Notice
            </Button>
          }
        />

        {isLoading ? (
          <Typography>Loading notices...</Typography>
        ) : noticeList.length === 0 ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary" align="center">
                No notices yet. Click "New Notice" to publish one.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {noticeList.map((notice) => (
              <Grid item xs={12} md={6} key={notice.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6">{notice.title}</Typography>
                      <Chip
                        label={isExpired(notice) ? 'Expired' : 'Active'}
                        color={isExpired(notice) ? 'default' : 'success'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {notice.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Expires {format(new Date(notice.expiry_date), 'MMM dd, yyyy')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(notice)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(notice.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingNotice ? 'Edit Notice' : 'New Notice'}</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <TextField
                autoFocus
                label="Title"
                fullWidth
                variant="outlined"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Expiry Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                {...register('expiry_date', { required: 'Expiry date is required' })}
                error={!!errors.expiry_date}
                helperText={errors.expiry_date?.message || 'The notice stops showing after this date'}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving...' : editingNotice ? 'Save Changes' : 'Publish Notice'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default NoticeBoard;
