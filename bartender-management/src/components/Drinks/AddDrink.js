import React, { useState } from 'react';
import { db, storage } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './AddDrink.css';

function AddDrink() {
    const [previewImage, setPreviewImage] = useState(null);
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [steps, setSteps] = useState(['']);
    const [categories] = useState([  
        { id: 'cocktail', name: 'Cocktail' },
        { id: 'mocktail', name: 'Mocktail' },
        { id: 'shot', name: 'Shot' },
        { id: 'classic', name: 'Classic' },
        { id: 'signature', name: 'Signature Drink' }
    ]);
    const [formData, setFormData] = useState({
        recipeName: '',
        description: '',
        image: null,
        category: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            const file = files[0];
            if (file && file.type.startsWith('image/')) {
                setFormData({ ...formData, image: file });
                setPreviewImage(URL.createObjectURL(file));
            } else {
                alert('Please select a valid image file');
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleIngredientChange = (index, e) => {
        const { name, value } = e.target;
        const updatedIngredients = [...ingredients];
        updatedIngredients[index][name] = value;
        setIngredients(updatedIngredients);
    };

    const handleStepChange = (index, e) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = e.target.value;
        setSteps(updatedSteps);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };

    const removeIngredient = (index) => {
        const updatedIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(updatedIngredients);
    };

    const addStep = () => {
        setSteps([...steps, '']);
    };

    const removeStep = (index) => {
        const updatedSteps = steps.filter((_, i) => i !== index);
        setSteps(updatedSteps);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Check if required fields are filled
        if (!formData.recipeName || !formData.description || !formData.category || ingredients.length === 0 || steps.length === 0) {
            alert('Please fill in all required fields.');
            return;
        }
    
        let imageUrl = '';
        if (formData.image) {
            try {
                console.log("Uploading image...");
                const imageRef = ref(storage, `drink-images/${Date.now()}_${formData.image.name}`);
                const snapshot = await uploadBytes(imageRef, formData.image);
                imageUrl = await getDownloadURL(snapshot.ref); // Sửa ở đây
                console.log("Image uploaded successfully:", imageUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
                alert('Error: Unable to upload image. Please try again.');
                return; // Abort the process if image upload fails
            }
        }
    
        // Log the data being uploaded to Firestore
        const dataToSubmit = {
            recipeName: formData.recipeName,
            description: formData.description,
            category: formData.category,
            ingredients: ingredients,
            steps: steps,
            imageURL: imageUrl
        };
    
        console.log("Form data being submitted:", dataToSubmit);
        console.log("Data types:", {
            recipeName: typeof formData.recipeName,
            description: typeof formData.description,
            category: typeof formData.category,
            imageUrl: typeof imageUrl,
            ingredients: ingredients.map(ing => ({
                name: typeof ing.name,
                quantity: typeof ing.quantity,
                unit: typeof ing.unit,
            })),
            steps: steps.map(step => typeof step),
        });
    
        // Submit data to Firestore
        try {
            const drinksCollection = collection(db, 'recipes');
            const docRef = await addDoc(drinksCollection, dataToSubmit);
            console.log("Document written with ID: ", docRef.id);
    
            alert('Recipe added successfully');
            navigate('/recipes'); // Redirect to recipes page after successful submission
        } catch (error) {
            console.error("Error adding recipe:", error);
            alert('Error: Unable to add the recipe. Please try again.');
        }
    };
    

    return (
        <div className="add-drink-container">
            <h2>Add a New Recipe</h2>
            <form onSubmit={handleSubmit} className="form-container">
                <div className="card">
                    <h4>General Information</h4>
                    <div className="form-group">
                        <label>Recipe Name:</label>
                        <input
                            type="text"
                            name="recipeName"
                            value={formData.recipeName}
                            onChange={handleChange}
                            placeholder="Enter recipe name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter recipe description"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Category:</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="card">
                    <h4>Ingredients</h4>
                    {ingredients.map((ingredient, index) => (
                        <div key={index} className="ingredient-group">
                            <div className="form-group">
                                <label>Ingredient Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={ingredient.name}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    placeholder="Enter ingredient name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    placeholder="Enter quantity"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Unit:</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={ingredient.unit}
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    placeholder="Enter unit"
                                    required
                                />
                            </div>
                            <button type="button" onClick={() => removeIngredient(index)}>Remove Ingredient</button>
                        </div>
                    ))}
                    <button type="button" onClick={addIngredient}>Add Ingredient</button>
                </div>

                <div className="card">
                    <h4>Steps</h4>
                    {steps.map((step, index) => (
                        <div key={index} className="form-group">
                            <label>Step {index + 1}:</label>
                            <textarea
                                value={step}
                                onChange={(e) => handleStepChange(index, e)}
                                placeholder="Describe the step"
                                required
                            />
                            <button type="button" onClick={() => removeStep(index)}>Remove Step</button>
                        </div>
                    ))}
                    <button type="button" onClick={addStep}>Add Step</button>
                </div>

                <div className="card">
                    <h4>Image</h4>
                    <div className="form-group">
                        <label>Upload Image:</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                        />
                        {previewImage && <img src={previewImage} alt="Preview" className="preview-image" />}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Add Recipe</button>
            </form>
        </div>
    );
}

export default AddDrink;
