import React, { useState, useEffect } from 'react';
import { Grid, TextField, Card, CardContent, CardActions, Typography, Button, CardMedia } from '@mui/material';
import { COLORS } from '../utils/constants';
import { getRecipes, updateRecipe, deleteRecipe } from '../services/recipesService';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      const recipeList = await getRecipes();
      setRecipes(recipeList);
    };
    fetchRecipes();
  }, []);

  const handleEdit = async (recipeId, data) => {
    await updateRecipe(recipeId, data);
    setRecipes(recipes.map(r => r.id === recipeId ? { ...r, ...data } : r));
  };

  const handleDelete = async (recipeId) => {
    await deleteRecipe(recipeId);
    setRecipes(recipes.filter(r => r.id !== recipeId));
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ backgroundColor: COLORS.CARD, marginBottom: 2 }}
        />
      </Grid>
      {filteredRecipes.map(recipe => (
        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
          <Card sx={{ backgroundColor: COLORS.CARD, boxShadow: 1 }}>
            <CardMedia
              component="img"
              height="140"
              image={recipe.imageURL}
              alt={recipe.recipeName}
            />
            <CardContent>
              <Typography variant="h6" sx={{ color: COLORS.TEXT }}>{recipe.recipeName}</Typography>
              <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>{recipe.category}</Typography>
              <Typography variant="body2" sx={{ color: COLORS.SUBTEXT }}>Premium: {recipe.isPremiumRecipe ? 'Yes' : 'No'}</Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={() => handleEdit(recipe.id, { /* Dữ liệu mới */ })} sx={{ backgroundColor: COLORS.PRIMARY, '&:hover': { backgroundColor: '#45A049' } }}>
                Edit
              </Button>
              <Button variant="contained" onClick={() => handleDelete(recipe.id)} sx={{ backgroundColor: '#FF4444', '&:hover': { backgroundColor: '#CC0000' } }}>
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Recipes;