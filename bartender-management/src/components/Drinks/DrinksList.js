// src/components/Drinks/DrinksList.js
import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function DrinksList() {
    const [drinks, setDrinks] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchDrinks = async () => {
            const drinksCollection = collection(db, 'drinks');
            const drinksSnapshot = await getDocs(drinksCollection);
            const drinksList = drinksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDrinks(drinksList);
        };

        const fetchCategories = async () => {
            const categoriesCollection = collection(db, 'categories');
            const categoriesSnapshot = await getDocs(categoriesCollection);
            const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(categoriesList);
        };

        fetchDrinks();
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đồ uống này?')) {
            try {
                const drinkDoc = doc(db, 'drinks', id);
                await deleteDoc(drinkDoc);
                setDrinks(drinks.filter(drink => drink.id !== id));
            } catch (error) {
                console.error("Error deleting drink: ", error);
                alert('Không thể xóa đồ uống này.');
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'N/A';
    };

    return (
        <div>
            <h2>Danh Sách Đồ Uống</h2>
            <Link to="/drinks/add" className="btn btn-primary mb-3">Thêm Đồ Uống</Link>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Hình Ảnh</th>
                        <th>Tên</th>
                        <th>Công Thức</th>
                        <th>Danh Mục</th>
                        <th>Giá</th>
                        <th>Tồn Kho</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {drinks.map(drink => (
                        <tr key={drink.id}>
                            <td>
                                {drink.imageUrl ? (
                                    <img src={drink.imageUrl} alt={drink.name} width="50" />
                                ) : (
                                    'No Image'
                                )}
                            </td>
                            <td>{drink.name}</td>
                            <td>{drink.recipeName}</td>
                            <td>{getCategoryName(drink.categoryId)}</td>
                            <td>{drink.price.toFixed(2)} VNĐ</td>
                            <td>{drink.stock}</td>
                            <td>
                                <Link to={`/drinks/edit/${drink.id}`} className="btn btn-warning btn-sm me-2">Sửa</Link>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(drink.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DrinksList;
