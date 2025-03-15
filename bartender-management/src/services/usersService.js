import { db } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (userId, data) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      last_updated: new Date() // Tự động cập nhật thời gian
    });
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    throw error;
  }
};

export const deleteUser = async (user_id) => {
  const userRef = doc(db, 'users', user_id);
  await deleteDoc(userRef);
};