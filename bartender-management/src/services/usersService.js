import { db } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (user_id, data) => {
  const userRef = doc(db, 'users', user_id);
  await updateDoc(userRef, data);
};

export const deleteUser = async (user_id) => {
  const userRef = doc(db, 'users', user_id);
  await deleteDoc(userRef);
};