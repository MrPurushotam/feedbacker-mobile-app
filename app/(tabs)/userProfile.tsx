import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slice/authSlice';

const UserProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state: any) => state.auth);
  const handleLogout = async () => {
    try {
      // @ts-ignore
      dispatch(logout());
      router.replace("/login");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <View className='flex-1 mt-8 p-4'>
      <View className='w-full mb-8'>
        <Text className='text-2xl font-bold mb-4'>Profile</Text>
        {user && (
          <View>
            <Text className='text-lg mb-2'>Name: {user.name}</Text>
            <Text className='text-lg mb-2'>Email: {user.email}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        className='bg-red-600 p-4 shadow-sm rounded-md mb-4'
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <Text className='text-white text-lg font-semibold tracking-wide text-center'>
            Logout
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default UserProfile