import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const getReports = async () => {
  const reportCollection = collection(db, "reports");
  const snapshot = await getDocs(reportCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteReport = async (reportId) => {
  const reportDoc = doc(db, "reports", reportId);
  await deleteDoc(reportDoc);
};