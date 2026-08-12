import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ============================================================
// 🔧 DÁN CẤU HÌNH FIREBASE CỦA BẠN VÀO ĐÂY
// Xem hướng dẫn lấy thông tin này trong file README.md (Bước 2)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyA9iLMF9-dMarehP39U7zwHE8Shau6oQag",
  authDomain: "wedding-4dc41.firebaseapp.com",
  projectId: "wedding-4dc41",
  storageBucket: "wedding-4dc41.firebasestorage.app",
  messagingSenderId: "470772097587",
  appId: "1:470772097587:web:3a6edf5c588dceaec63946"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
