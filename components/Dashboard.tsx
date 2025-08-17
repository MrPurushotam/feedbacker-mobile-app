import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { MaterialIcons } from '@expo/vector-icons'
import { fetchMyForms } from '@/store/slice/formSlice'

const Dashboard = () => {
  const { user, isLoggedIn } = useSelector((state: any) => state.auth)
  const { forms, isLoading, error } = useSelector((state: any) => state.form);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router])

  const renderForm = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100 flex-row items-center"
      onPress={() => router.push(`/stats/${item.id}`)}
    >
      {/* Icon */}
      <View className="bg-blue-100 p-3 rounded-lg mr-3">
        <MaterialIcons name="description" size={24} color="#2563eb" />
      </View>

      {/* Form details */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
          {item.description || "No description"}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-blue-600 px-6 py-8 rounded-b-3xl">
        <Text className="text-2xl font-bold text-white">Dashboard</Text>
        <Text className="text-white/90 mt-1 text-base">
          Welcome back, {user?.name || "User"} 👋
        </Text>
      </View>

      {/* Action Button */}
      <View className="px-6 -mt-6">
        <Pressable
          className="bg-white p-4 rounded-xl shadow-md"
          onPress={() => router.push('/form/createform')}
        >
          <Text className="text-blue-600 text-center font-semibold text-lg">
            ➕ Create New Form
          </Text>
        </Pressable>
      </View>

      {/* Forms Section */}
      <View className="flex-1 px-6 mt-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">My Forms</Text>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-2">Loading forms...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 text-center mb-2">Error: {error}</Text>
            <TouchableOpacity
              onPress={() => dispatch(fetchMyForms({ userId: user?.id }))}
              className="bg-blue-600 px-5 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : forms.length > 0 ? (
          <FlatList
            data={forms}
            renderItem={renderForm}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-gray-400 text-lg font-medium text-center">
              No forms yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/form/createform')}
              className="mt-4 bg-blue-600 px-5 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Create Your First Form</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

export default Dashboard
