import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'expo-router'
import GenericFormView from '@/components/GenericFormView'
import { fetchMyForms } from '@/store/slice/formSlice'
import { Ionicons } from '@expo/vector-icons'

const Track = () => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { user, isLoggedIn } = useSelector((state: any) => state.auth);
  const { forms, isLoading, error } = useSelector((state: any) => state.form);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await dispatch(fetchMyForms({ userId: user.id }));
    }
    setRefreshing(false);
  }, [dispatch, user?.id]);

  if (!isLoggedIn) {
    return (
      <View className="flex-1 bg-gray-50 ">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-sm">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={32} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                Login Required
              </Text>
              <Text className="text-gray-600 text-center leading-relaxed">
                Please log in to view your form statistics
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => router.push('/login')}
              className="bg-blue-600 py-3 px-6 rounded-lg shadow-sm"
            >
              <Text className="text-white font-semibold text-center text-lg">
                Login to Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Enhanced Header Section */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-3xl font-bold text-gray-800">
              Form Analytics
            </Text>
            <Text className="text-gray-600 mt-1">
              Track performance and view responses
            </Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="stats-chart" size={24} color="#3b82f6" />
            </View>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView 
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-4 text-center font-medium">
                Loading your forms...
              </Text>
            </View>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="warning" size={32} color="#ef4444" />
                </View>
                <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                  Unable to Load Forms
                </Text>
                <Text className="text-gray-600 text-center mb-4">
                  {error}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-blue-600 py-3 px-6 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : forms && forms.length > 0 ? (
          <View className="pb-6">
            {/* Stats Summary Card */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  Overview
                </Text>
                <TouchableOpacity
                  onPress={onRefresh}
                  className="flex-row items-center"
                >
                  <Ionicons name="refresh" size={18} color="#6b7280" />
                  <Text className="text-gray-500 ml-1 font-medium">Refresh</Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="document-text" size={24} color="#3b82f6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {forms.length}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {forms.length === 1 ? 'Form' : 'Forms'}
                  </Text>
                </View>
                
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {forms.filter((form: any) => form.isActive).length}
                  </Text>
                  <Text className="text-sm text-gray-500">Active</Text>
                </View>
                
                <View className="items-center flex-1">
                  <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name="people" size={24} color="#8b5cf6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {forms.reduce((total: number, form: any) => total + (form.responseCount || 0), 0)}
                  </Text>
                  <Text className="text-sm text-gray-500">Responses</Text>
                </View>
              </View>
            </View>

            {/* Forms List */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Your Forms
              </Text>
              
              {forms.map((form: any, index: number) => (
                <View key={form.id} className={index !== forms.length - 1 ? "mb-3" : ""}>
                  <GenericFormView form={form} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="stats-chart-outline" size={40} color="#6b7280" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                  No Analytics Yet
                </Text>
                <Text className="text-gray-600 text-center leading-relaxed mb-6">
                  Create your first form to start tracking statistics and collecting feedback
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => router.push('/createform')}
                className="bg-blue-600 py-3 px-6 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Create Your First Form
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default Track