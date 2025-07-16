import { logout } from '@/store/slice/authSlice'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import GenericFormView from './GenericFormView'
import { fetchMyForms } from '@/store/slice/formSlice'

const Dashboard = () => {
  const { user, isLoggedIn } = useSelector((state: any) => state.auth)
  const router = useRouter();
  const { forms, isLoading, error } = useSelector((state: any) => state.form);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router])

  const renderForm = ({ item }: { item: any }) => (
    <GenericFormView form={item} />
  )

  return (
    <View className='h-full w-full gap-2 py-8'>

      <View className='p-3 my-4'>
        {isLoggedIn ? (
          <Text className="text-lg capitalize font-semibold tracking-wide mb-4">
            Welcome, {user?.name || "User"}
          </Text>
        ) : (
          <TouchableOpacity
            className='bg-blue-600 p-4 shadow-sm rounded-md mb-4'
            onPress={() => router.push("/login")}
          >
            <Text className='text-white text-lg font-semibold tracking-wide text-center'>
              Login
            </Text>
          </TouchableOpacity>
        )}

        <Pressable
          className='rounded-md p-3 bg-blue-600 shadow-md shadow-blue-400 w-1/3'
          onPress={() => router.push('/createform')}
        >
          <Text className='text-white text-center font-medium'>
            Create Form
          </Text>
        </Pressable>
      </View>

      <View className='flex-1 px-3'>
        <Text className='text-xl font-semibold text-gray-800 mb-4'>
          My Forms
        </Text>

        {isLoading ? (
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className='text-gray-600 mt-2'>Loading forms...</Text>
          </View>
        ) : error ? (
          <View className='flex-1 justify-center items-center'>
            <Text className='text-red-500 text-center mb-2'>Error: {error}</Text>
            <TouchableOpacity
              onPress={() => dispatch(fetchMyForms({ userId: user?.id }))}
              className='bg-blue-600 px-4 py-2 rounded-md'
            >
              <Text className='text-white'>Retry</Text>
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
          <View className='flex-1 justify-center items-center'>
            <Text className='text-gray-500 text-center'>
              No forms found. Create your first form!
            </Text>
          </View>
        )}
      </View>

    </View>
  )
}

export default Dashboard
