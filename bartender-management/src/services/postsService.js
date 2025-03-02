import { db } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const getPosts = async () => {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updatePost = async (postId, data) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, data);
};

export const deletePost = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
};