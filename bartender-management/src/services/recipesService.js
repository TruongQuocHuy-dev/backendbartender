// src/services/recipesService.js
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc  } from "firebase/firestore";
import { db } from "./firebase";

export const getRecipes = async () => {
  const recipeCollection = collection(db, "recipes");
  const snapshot = await getDocs(recipeCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateRecipe = async (recipeId, data) => {
  const recipeRef = doc(db, "recipes", recipeId);
  await updateDoc(recipeRef, data);
};

export const deleteRecipe = async (recipeId) => {
  const recipeRef = doc(db, "recipes", recipeId);
  await deleteDoc(recipeRef);
};

// Thêm công thức vào Firestore
export const addRecipe = async (recipeData) => {
  try {
    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding recipe: ", e);
  }
};