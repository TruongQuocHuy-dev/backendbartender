// services/paymentsService.js
import { db } from './firebase'; // Giả sử file firebase config nằm cùng thư mục
import { collection, getDocs } from 'firebase/firestore';

// Hàm lấy danh sách payments từ Firestore
export const getPayments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'payments'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching payments from Firestore:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};