import React, { useState, useEffect } from 'react';
import { Grid, TextField, Card, CardContent, CardActions, Typography, Button, CardMedia, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { COLORS } from '../utils/constants';
import { getBanners, updateBanner, deleteBanner, addBanner } from '../services/bannersService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { Timestamp } from 'firebase/firestore'; // Thêm import Timestamp

const BannersScreen = () => {
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    image: null,
  });
  const [editBanner, setEditBanner] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      const bannerList = await getBanners();
      setBanners(bannerList);
    };
    fetchBanners();
  }, []);

  const handleChange = (e, setBanner) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setBanner(prev => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file));
      } else {
        alert('Please select a valid image file');
      }
    } else if (name === 'createdAt') {
      const date = new Date(value);
      setBanner(prev => ({ ...prev, createdAt: Timestamp.fromDate(date) }));
    } else {
      setBanner(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.description || !newBanner.image) {
      alert('Please fill in all required fields.');
      return;
    }

    let image = '';
    try {
      const imageRef = ref(storage, `banner-images/${Date.now()}_${newBanner.image.name}`);
      const snapshot = await uploadBytes(imageRef, newBanner.image);
      image = await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
      return;
    }

    const bannerData = {
      title: newBanner.title,
      description: newBanner.description,
      image: image,
    };

    try {
      const newBannerId = await addBanner(bannerData);
      const updatedBanners = await getBanners();
      setBanners(updatedBanners);
      setOpenAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Error adding banner. Please try again.');
    }
  };

  const handleEdit = (banner) => {
    setEditBanner({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      image: null,
      image: banner.image,
      createdAt: banner.createdAt, // Timestamp từ Firestore
    });
    setPreviewImage(banner.image);
    setOpenEditDialog(true);
  };

  const handleUpdateBanner = async () => {
    if (!editBanner.title || !editBanner.description) {
      alert('Please fill in all required fields.');
      return;
    }

    let image = editBanner.image;
    if (editBanner.image) {
      try {
        const imageRef = ref(storage, `banner-images/${Date.now()}_${editBanner.image.name}`);
        const snapshot = await uploadBytes(imageRef, editBanner.image);
        image = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    const updatedData = {
      title: editBanner.title,
      description: editBanner.description,
      image: image,
      createdAt: editBanner.createdAt, // Gửi createdAt đã chỉnh sửa
    };

    try {
      await updateBanner(editBanner.id, updatedData);
      const updatedBanners = await getBanners();
      setBanners(updatedBanners);
      setOpenEditDialog(false);
      setEditBanner(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Error updating banner. Please try again.');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(bannerId);
        setBanners(banners.filter(b => b.id !== bannerId));
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Error deleting banner. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setNewBanner({
      title: '',
      description: '',
      image: null,
    });
    setPreviewImage(null);
  };

  const filteredBanners = banners.filter(banner => {
    const matchesSearch =
      (banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       banner.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = selectedDate
      ? banner.createdAt && new Date(banner.createdAt.seconds * 1000).toISOString().split('T')[0] === selectedDate
      : true;
    return matchesSearch && matchesDate;
  });

  const renderItem = ({ item }) => {
    const truncatedDescription = item.description.length > 50 
      ? item.description.substring(0, 50) + '...' 
      : item.description;

    return (
      <Card sx={{ margin: 1, backgroundColor: COLORS.CARD, boxShadow: 4 }}>
        <CardMedia
          component="img"
          height="140"
          image={item.image || 'https://via.placeholder.com/300'}
          alt={item.title || 'Banner'}
        />
        <CardContent>
          <Typography variant="h6" sx={{ color: COLORS.TEXT }}>{item.title || 'Untitled Banner'}</Typography>
          <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>{truncatedDescription || 'No description'}</Typography>
          <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>
            Created At: {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={() => handleEdit(item)}
            sx={{ backgroundColor: COLORS.PRIMARY, '&:hover': { backgroundColor: '#45A049' } }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            onClick={() => handleDelete(item.id)}
            sx={{ backgroundColor: '#FF4444', '&:hover': { backgroundColor: '#CC0000' } }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  };

  const BannerForm = ({ banner, setBanner, onSubmit }) => {
    const getDateString = (timestamp) => {
      if (!timestamp || !timestamp.seconds) return '';
      const date = new Date(timestamp.seconds * 1000);
      return date.toISOString().split('T')[0];
    };

    return (
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Title"
          fullWidth
          name="title"
          value={banner.title}
          onChange={(e) => handleChange(e, setBanner)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Description"
          fullWidth
          name="description"
          value={banner.description}
          onChange={(e) => handleChange(e, setBanner)}
          multiline
          rows={4}
          sx={{ marginBottom: 2 }}
          required
        />
        <Typography variant="h6">Image</Typography>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => handleChange(e, setBanner)}
        />
        {previewImage && (
          <Box sx={{ marginTop: 2 }}>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Box>
        )}
        {banner === editBanner && (
          <TextField
            label="Created At"
            fullWidth
            type="date"
            name="createdAt"
            value={getDateString(banner.createdAt)}
            onChange={(e) => handleChange(e, setBanner)}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />
        )}
        <DialogActions>
          <Button onClick={() => (banner === newBanner ? setOpenAddDialog(false) : setOpenEditDialog(false))} color="primary">
            Cancel
          </Button>
          <Button onClick={onSubmit} color="primary">
            {banner === newBanner ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Box>
    );
  };

  return (
    <Grid container sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          placeholder="Search banners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ marginBottom: 2, backgroundColor: COLORS.CARD }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          label="Filter by Creation Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ marginBottom: 2 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: COLORS.PRIMARY, marginBottom: 2 }}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Banner
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {filteredBanners.length === 0 ? (
            <Typography>No banners found</Typography>
          ) : (
            filteredBanners.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                {renderItem({ item })}
              </Grid>
            ))
          )}
        </Grid>
      </Grid>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Add New Banner</DialogTitle>
        <DialogContent>
          <BannerForm banner={newBanner} setBanner={setNewBanner} onSubmit={handleAddBanner} />
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit Banner</DialogTitle>
        <DialogContent>
          {editBanner && (
            <BannerForm banner={editBanner} setBanner={setEditBanner} onSubmit={handleUpdateBanner} />
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default BannersScreen;
