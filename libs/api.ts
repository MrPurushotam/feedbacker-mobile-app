import { clearUser } from '@/store/slice/authSlice';
import { ReduxStore } from '@/store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Redirect } from "expo-router";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.data?.jwtExpired) {
      await AsyncStorage.removeItem('token');
      ReduxStore.dispatch(clearUser());
      return; 
    }

    if (!error.response) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);
