import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardScreen from '../screens/DashboardScreen';
import UsersScreen from '../screens/UsersScreen';
import PostsScreen from '../screens/PostsScreen';
import RecipesScreen from '../screens/RecipesScreen';
import BannersScreen from '../screens/BannersScreen';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { SCREEN_NAMES } from '../utils/constants';
import ReportsScreen from '../screens/ReportsScreen';

const AppNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState(SCREEN_NAMES.DASHBOARD);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar currentScreen={currentScreen} />
      <div style={{ flexGrow: 1 }}>
        <Header userName="Tính Lê" onToggleTheme={() => {}} />
        <Routes>
          <Route path="/dashboard" element={<DashboardScreen />} onEnter={() => setCurrentScreen(SCREEN_NAMES.DASHBOARD)} />
          <Route path="/users" element={<UsersScreen />} onEnter={() => setCurrentScreen(SCREEN_NAMES.USERS)} />
          <Route path="/posts" element={<PostsScreen />} onEnter={() => setCurrentScreen(SCREEN_NAMES.POSTS)} />
          <Route path="/recipes" element={<RecipesScreen />} onEnter={() => setCurrentScreen(SCREEN_NAMES.RECIPES)} />
          <Route path="/banners" element={<BannersScreen />} onEnter={() => setCurrentScreen(SCREEN_NAMES.BANNERS)} />
          <Route path="/reports" element={<ReportsScreen />} onEnter={() => setCurrentScreen(SCREEN_NAMES.REPORTS)}/>
        </Routes>
      </div>
    </div>
  );
};

export default AppNavigator;