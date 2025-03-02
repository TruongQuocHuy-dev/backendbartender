// src/components/Drinks/EditDrink.js
import React, { useEffect, useState } from 'react';
import { db, storage } from '../../services/firebase';
import { doc, getDocs, updateDoc, collection, getDoc} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate, useParams } from 'react-router-dom';

function EditDrink() {
    const { id } = useParams();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        recipeName: '',
        description: '',
        ingredients: '',
        instructions: '',
        price: '',
        stock: '',
        image: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy danh mục
                const categoriesCollection = collection(db, 'categories');
                const categoriesSnapshot = await getDocs(categoriesCollection);
                const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(categoriesList);

                // Lấy thông tin đồ uống
                const drinkDoc = doc(db, 'drinks', id);
                const drinkSnapshot = await getDoc(drinkDoc);
                if (drinkSnapshot.exists()) {
                    const data = drinkSnapshot.data();
                    setFormData({
                        categoryId: data.categoryId || '',
                        name: data.name,
                        recipeName: data.recipeName || '',
                        description: data.description || '',
                        ingredients: data.ingredients.join('\n') || '',
                        instructions: data.instructions || '',
                        price: data.price,
                        stock: data.stock,
                        image: null // Không tải lại hình ảnh cũ
                    });
                } else {
                    alert('Đồ uống không tồn tại.');
                    navigate('/drinks');
                }
            } catch (error) {
                console.error("Error fetching drink: ", error);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = '';
            if (formData.image) {
                const imageRef = ref(storage, `drink-images/${Date.now()}_${formData.image.name}`);
                const snapshot = await uploadBytes(imageRef, formData.image);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const drinkDoc = doc(db, 'drinks', id);
            const updatedData = {
                categoryId: formData.categoryId,
                name: formData.name,
                recipeName: formData.recipeName,
                description: formData.description,
                ingredients: formData.ingredients.split('\n'), // Lưu nguyên liệu dưới dạng mảng
                instructions: formData.instructions,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            };

            if (imageUrl) {
                updatedData.imageUrl = imageUrl;
            }

            await updateDoc(drinkDoc, updatedData);
            navigate('/drinks');
        } catch (error) {
            console.error("Error updating drink: ", error);
            alert('Cập nhật đồ uống thất bại.');
        }
    };

    return (
        <div>
            <h2>Sửa Đồ Uống</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Danh Mục:</label>
                    <select
                        className="form-select"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Tên Đồ Uống:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Tên Công Thức:</label>
                    <input
                        type="text"
                        className="form-control"
                        name="recipeName"
                        value={formData.recipeName}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mô Tả:</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Nguyên Liệu:</label>
                    <textarea
                        className="form-control"
                        name="ingredients"
                        value={formData.ingredients}
                        onChange={handleChange}
                        placeholder="Liệt kê nguyên liệu, mỗi nguyên liệu trên một dòng"
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Cách Làm:</label>
                    <textarea
                        className="form-control"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Giá:</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Tồn Kho:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Hình Ảnh Mới:</label>
                    <input
                        type="file"
                        className="form-control"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Cập Nhật Đồ Uống</button>
            </form>
        </div>
    );
}

export default EditDrink;
