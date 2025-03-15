import { db, storage } from '../services/firebase';
import React, { useState, useEffect } from 'react';
import { Grid, TextField, Card, CardContent, CardActions, Typography, Button, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { COLORS } from '../utils/constants';
import { getRecipes, updateRecipe, deleteRecipe, addRecipe } from '../services/recipesService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const RecipesScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    recipeName: '',
    category: '',
    description: '',
    image: null,
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [''],
    isPremiumRecipe: false,
  });
  const [editRecipe, setEditRecipe] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Example categories (you can fetch this dynamically if needed)
  const categories = [
    'Cocktail',
    'Mocktail',
    'Shot',
    'Classic',
    'Signature Drink',
    // Add more categories as needed
  ];

  useEffect(() => {
    const fetchRecipes = async () => {
      const recipeList = await getRecipes();
      setRecipes(recipeList);
    };
    fetchRecipes();
  }, []);

  const handleEdit = (recipe) => {
    setEditRecipe({
      id: recipe.id,
      recipeName: recipe.recipeName,
      category: recipe.category,
      description: recipe.description,
      image: null,
      imageURL: recipe.imageURL,
      ingredients: recipe.ingredients || [{ name: '', quantity: '', unit: '' }],
      steps: recipe.steps || [''],
      isPremiumRecipe: recipe.isPremiumRecipe || false,
    });
    setPreviewImage(recipe.imageURL);
    setOpenEditDialog(true);
  };

  const handleDelete = async (recipeId) => {
    console.log('Deleting recipe with ID:', recipeId);
    await deleteRecipe(recipeId);
    setRecipes(recipes.filter(r => r.id !== recipeId));
  };

  const handleChange = (e, setRecipe) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setRecipe(prev => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file));
      } else {
        alert('Please select a valid image file');
      }
    } else {
      setRecipe(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIngredientChange = (index, e, setRecipe) => {
    const { name, value } = e.target;
    const updatedIngredients = [...setRecipe().ingredients];
    updatedIngredients[index][name] = value;
    setRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const handleStepChange = (index, e, setRecipe) => {
    const updatedSteps = [...setRecipe().steps];
    updatedSteps[index] = e.target.value;
    setRecipe(prev => ({ ...prev, steps: updatedSteps }));
  };

  const addIngredient = (setRecipe) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }],
    }));
  };

  const removeIngredient = (index, setRecipe) => {
    const updatedIngredients = setRecipe().ingredients.filter((_, i) => i !== index);
    setRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addStep = (setRecipe) => {
    setRecipe(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (index, setRecipe) => {
    const updatedSteps = setRecipe().steps.filter((_, i) => i !== index);
    setRecipe(prev => ({ ...prev, steps: updatedSteps }));
  };

  const handleAddRecipe = async () => {
    if (!newRecipe.recipeName || !newRecipe.category || !newRecipe.description || newRecipe.ingredients.length === 0 || newRecipe.steps.length === 0) {
      alert('Please fill in all required fields.');
      return;
    }

    let imageUrl = '';
    if (newRecipe.image) {
      try {
        const imageRef = ref(storage, `drink-images/${Date.now()}_${newRecipe.image.name}`);
        const snapshot = await uploadBytes(imageRef, newRecipe.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    const recipeData = {
      recipeName: newRecipe.recipeName,
      category: newRecipe.category,
      description: newRecipe.description,
      imageURL: imageUrl || newRecipe.imageURL,
      ingredients: newRecipe.ingredients,
      steps: newRecipe.steps,
      isPremiumRecipe: newRecipe.isPremiumRecipe,
    };

    const newRecipeId = await addRecipe(recipeData);
    setRecipes([...recipes, { id: newRecipeId, ...recipeData }]);
    setOpenAddDialog(false);
    resetForm();
  };

  const handleUpdateRecipe = async () => {
    if (!editRecipe.recipeName || !editRecipe.category || !editRecipe.description || editRecipe.ingredients.length === 0 || editRecipe.steps.length === 0) {
      alert('Please fill in all required fields.');
      return;
    }

    let imageUrl = editRecipe.imageURL;
    if (editRecipe.image) {
      try {
        const imageRef = ref(storage, `drink-images/${Date.now()}_${editRecipe.image.name}`);
        const snapshot = await uploadBytes(imageRef, editRecipe.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    const updatedData = {
      recipeName: editRecipe.recipeName,
      category: editRecipe.category,
      description: editRecipe.description,
      imageURL: imageUrl,
      ingredients: editRecipe.ingredients,
      steps: editRecipe.steps,
      isPremiumRecipe: editRecipe.isPremiumRecipe,
    };

    await updateRecipe(editRecipe.id, updatedData);
    setRecipes(recipes.map(r => (r.id === editRecipe.id ? { id: r.id, ...updatedData } : r)));
    setOpenEditDialog(false);
    setEditRecipe(null);
    setPreviewImage(null);
  };

  const resetForm = () => {
    setNewRecipe({
      recipeName: '',
      category: '',
      description: '',
      image: null,
      ingredients: [{ name: '', quantity: '', unit: '' }],
      steps: [''],
      isPremiumRecipe: false,
    });
    setPreviewImage(null);
  };

  // Filter recipes based on search query and selected category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.recipeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }) => (
    <Card sx={{ margin: 1, backgroundColor: COLORS.CARD, boxShadow: 4 }}>
      <CardMedia component="img" height="140" image={item.imageURL} alt={item.recipeName} />
      <CardContent>
        <Typography variant="h6" sx={{ color: COLORS.TEXT }}>{item.recipeName}</Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>{item.category}</Typography>
        <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>Premium: {item.isPremiumRecipe ? 'Yes' : 'No'}</Typography>
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

  const RecipeForm = ({ recipe, setRecipe, onSubmit }) => (
    <>
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Recipe Name"
          fullWidth
          name="recipeName"
          value={recipe.recipeName}
          onChange={(e) => handleChange(e, setRecipe)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Category"
          fullWidth
          name="category"
          value={recipe.category}
          onChange={(e) => handleChange(e, setRecipe)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Description"
          fullWidth
          name="description"
          value={recipe.description}
          onChange={(e) => handleChange(e, setRecipe)}
          multiline
          rows={4}
          sx={{ marginBottom: 2 }}
          required
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <input
          type="checkbox"
          name="isPremiumRecipe"
          checked={recipe.isPremiumRecipe}
          onChange={(e) => setRecipe(prev => ({ ...prev, isPremiumRecipe: e.target.checked }))}
        />
        <Typography variant="body1" sx={{ marginLeft: 1 }}>Is this a premium recipe?</Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Ingredients</Typography>
        {recipe.ingredients.map((ingredient, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, e, setRecipe)}
              required
            />
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(index, e, setRecipe)}
              required
            />
            <TextField
              label="Unit"
              name="unit"
              value={ingredient.unit}
              onChange={(e) => handleIngredientChange(index, e, setRecipe)}
              required
            />
            <Button onClick={() => removeIngredient(index, setRecipe)} color="error">Remove</Button>
          </Box>
        ))}
        <Button onClick={() => addIngredient(setRecipe)} variant="outlined">Add Ingredient</Button>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Steps</Typography>
        {recipe.steps.map((step, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 1 }}>
            <TextField
              label={`Step ${index + 1}`}
              fullWidth
              value={step}
              onChange={(e) => handleStepChange(index, e, setRecipe)}
              multiline
              required
            />
            <Button onClick={() => removeStep(index, setRecipe)} color="error">Remove</Button>
          </Box>
        ))}
        <Button onClick={() => addStep(setRecipe)} variant="outlined">Add Step</Button>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Image</Typography>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => handleChange(e, setRecipe)}
        />
        {previewImage && (
          <Box sx={{ marginTop: 2 }}>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Box>
        )}
      </Box>
      <DialogActions>
        <Button onClick={() => (recipe === newRecipe ? setOpenAddDialog(false) : setOpenEditDialog(false))} color="primary">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary">
          {recipe === newRecipe ? 'Add' : 'Update'}
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Grid container sx={{ padding: 2, backgroundColor: COLORS.BACKGROUND }}>
      <Grid item xs={12}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ marginBottom: 2, backgroundColor: COLORS.CARD }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {/* Category Filter */}
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Filter by Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Add Recipe Button */}
        <Button
          variant="contained"
          sx={{ backgroundColor: COLORS.PRIMARY, marginBottom: 2 }}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Recipe
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {filteredRecipes.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              {renderItem({ item })}
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Add Recipe Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Add New Recipe</DialogTitle>
        <DialogContent>
          <RecipeForm recipe={newRecipe} setRecipe={setNewRecipe} onSubmit={handleAddRecipe} />
        </DialogContent>
      </Dialog>

      {/* Edit Recipe Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit Recipe</DialogTitle>
        <DialogContent>
          {editRecipe && (
            <RecipeForm recipe={editRecipe} setRecipe={setEditRecipe} onSubmit={handleUpdateRecipe} />
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default RecipesScreen;