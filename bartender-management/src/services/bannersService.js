import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export const getBanners = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'banners'));
    const bannerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Banners fetched:', bannerList);
    return bannerList;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

export const addBanner = async (data) => {
  const bannerData = {
    ...data,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'banners'), bannerData);
  return docRef.id;
};

export const updateBanner = async (bannerId, data) => {
  try {
    await updateDoc(doc(db, 'banners', bannerId), data);
    console.log('Banner updated successfully!');
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
};

export const deleteBanner = async (bannerId) => {
  await deleteDoc(doc(db, 'banners', bannerId));
};