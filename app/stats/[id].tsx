import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { openFormWithResponses } from '@/store/slice/formSlice';
import { Ionicons } from '@expo/vector-icons';

const DetailedStats = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { formOpend, responseDetails, isLoading, error } = useSelector(
    (state: any) => state.form
  );
  useEffect(() => {
    if (id) {
      dispatch(openFormWithResponses({ id }));
    }
  }, [dispatch, id]);

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-red-500 font-medium">
          No form ID provided in the URL.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4 font-medium">Loading form details...</Text>
      </View>
    );
  }

  if (error || !formOpend) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full max-w-sm">
          <View className="items-center mb-4">
            <Ionicons name="warning" size={40} color="#ef4444" />
          </View>
          <Text className="text-xl font-bold text-center text-gray-800 mb-2">
            Invalid or Missing Form
          </Text>
          <Text className="text-center text-gray-600 mb-4">
            {error || 'No form found with the given ID.'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (router) router.back();
            }}
            className="bg-blue-600 py-3 px-4 rounded-lg"
          >
            <Text className="text-white font-semibold text-center">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View >
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-16">
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-2 justify-between">
            <Text className="text-2xl font-bold text-gray-800">
              {formOpend.title}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!router) return;
                router.push(`/form/edit/${formOpend.id}`)
              }}
              className="ml-2"
              accessibilityLabel="Edit Form"
            >
              <Ionicons name="create-outline" size={22} color="#2563eb" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mb-6">{formOpend.description || 'No description available'}</Text>

          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="document-text" size={24} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">{responseDetails.length}</Text>
              <Text className="text-sm text-gray-500">Responses</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                {formOpend.closed ? 'Closed' : 'Active'}
              </Text>
              <Text className="text-sm text-gray-500">Status</Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="calendar" size={24} color="#8b5cf6" />
              </View>
              <Text className="text-lg font-bold text-gray-800">
                {formOpend.created_at ? new Date(formOpend.created_at).toLocaleDateString() : 'N/A'}
              </Text>
              <Text className="text-sm text-gray-500">Created</Text>
            </View>
          </View>
        </View>

        {/* Show Questions */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-800 mb-4">Questions</Text>
          {formOpend.questions.length > 0 ? (
            formOpend.questions.map((q: any, idx: number) => (
              <View key={q.id || idx} className="mb-4">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  {idx + 1}. {q.question_text}
                </Text>
                <Text className="text-sm text-gray-500 mb-1">
                  Type: <Text className="font-medium">{q.question_type}</Text>
                  {q.is_required ? " • Required" : " • Optional"}
                </Text>
                {q.options?.length > 0 && (
                  <View className="ml-2 mt-1">
                    <Text className="text-sm text-gray-600 font-medium mb-1">Options:</Text>
                    {q.options.map((opt: any) => (
                      <Text key={opt.id} className="text-sm text-gray-700 ml-2">
                        - {opt.option_text}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text className="text-gray-500">No questions found.</Text>
          )}
        </View>
        {/* Show Responses */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">Responses</Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium text-sm">
                {responseDetails.length} Total
              </Text>
            </View>
          </View>

          {responseDetails.length > 0 ? (
            responseDetails.map((response: any, index: number) => (
              <View key={response.id || index} className="border border-gray-100 rounded-lg p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Response #{index + 1}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {response.created_at ? new Date(response.created_at).toLocaleString() : 'N/A'}
                  </Text>
                </View>

                {response.answers?.length > 0 ? (
                  response.answers.map((answer: any, idx: number) => {
                    const question = formOpend.questions.find((q: any) => q.id === answer.question_id);
                    return (
                      <View key={idx} className="mb-2">
                        <Text className="text-sm text-gray-500">
                          <Text className="font-semibold text-gray-700">
                            {question ? question.question_text : `Question ${idx + 1}`}:
                          </Text>
                          {" "}
                          {answer.answer_text
                            ? answer.answer_text
                            : answer.option_text
                              ? answer.option_text
                              : "-"}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text className="text-gray-500">No answers available.</Text>
                )}
              </View>
            ))
          ) : (
            <View className="items-center py-8">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="document-outline" size={32} color="#6b7280" />
              </View>
              <Text className="text-gray-500 text-lg font-medium mb-2">No responses yet</Text>
              <Text className="text-gray-400 text-center">
                Share your form to start collecting feedback
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailedStats;
