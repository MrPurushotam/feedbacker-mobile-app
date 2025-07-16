import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams,  useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { openFormWithResponses } from '@/store/slice/formSlice'
import GenericFormView from '@/components/GenericFormView'
import { Ionicons } from '@expo/vector-icons'

const Track = () => {
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  console.log(params);
  const id = params.id;

  const { forms, formOpend, responseDetails, isLoading, error } = useSelector(
    (state: any) => state.form
  );

  useEffect(() => {
    if (id) {
      console.log('Fetching form with ID:', id);
      dispatch(openFormWithResponses({ id }));
    }
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4 text-center font-medium">
              Loading form details...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm mx-4">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="warning" size={32} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                Something went wrong
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                {error}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-600 py-3 px-6 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (id && formOpend) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-3 p-1"
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-gray-800">
                Check Stats
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 ml-8">
            View detailed analytics and responses for your form
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {formOpend.title}
            </Text>
            <Text className="text-gray-600 mb-6 leading-relaxed">
              {formOpend.description || 'No description available'}
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="document-text" size={24} color="#3b82f6" />
                </View>
                <Text className="text-2xl font-bold text-gray-800">
                  {Array.isArray(responseDetails) ? responseDetails.length : 0}
                </Text>
                <Text className="text-sm text-gray-500">Responses</Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text className="text-2xl font-bold text-gray-800">
                  {formOpend.isActive ? 'Active' : 'Inactive'}
                </Text>
                <Text className="text-sm text-gray-500">Status</Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="calendar" size={24} color="#8b5cf6" />
                </View>
                <Text className="text-lg font-bold text-gray-800">
                  {new Date(formOpend.createdAt).toLocaleDateString()}
                </Text>
                <Text className="text-sm text-gray-500">Created</Text>
              </View>
            </View>
          </View>
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Recent Responses
              </Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-600 font-medium text-sm">
                  {Array.isArray(responseDetails) ? responseDetails.length : 0} Total
                </Text>
              </View>
            </View>

            {responseDetails && Array.isArray(responseDetails) && responseDetails.length > 0 ? (
              responseDetails.map((response: any, index: number) => (
                <View key={index} className="border border-gray-100 rounded-lg p-4 mb-3 last:mb-0">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Response #{index + 1}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(response.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text className="text-gray-700 leading-relaxed">
                    {response.content || JSON.stringify(response, null, 2)}
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="document-outline" size={32} color="#6b7280" />
                </View>
                <Text className="text-gray-500 text-lg font-medium mb-2">
                  No responses yet
                </Text>
                <Text className="text-gray-400 text-center">
                  Share your form to start collecting feedback
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-gray-800">
            Check Stats
          </Text>
        </View>
        <Text className="text-gray-600">
          Select a form to view detailed analytics and responses
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {forms && forms.length > 0 ? (
          <View className="pb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-4">
              {forms.length} {forms.length === 1 ? 'Form' : 'Forms'}
            </Text>
            {forms.map((form: any) => (
              <View key={form.id} className="mb-2">
                <GenericFormView form={form} />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="document-outline" size={40} color="#6b7280" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                  No Forms Yet
                </Text>
                <Text className="text-gray-600 text-center leading-relaxed">
                  Create your first form to start tracking statistics
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default Track