import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import GenericFormView from './GenericFormView';
import { fetchMyForms } from '@/store/slice/formSlice';
import { Ionicons } from '@expo/vector-icons';

const ListFormComponent = () => {
    const { user, isLoggedIn } = useSelector((state: any) => state.auth)
    const { forms, isLoading, error } = useSelector((state: any) => state.form);
    const dispatch = useDispatch();
    const router = useRouter();

    const renderForm = ({ item }: { item: any }) => (
        <GenericFormView form={item} showDropDownMenu={true} />
    );

    if (!isLoggedIn) {
        return (
            <View className=" w-full h-full bg-gray-50 mt-8 p-4">
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-sm">
                        <View className="items-center mb-6">
                            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="lock-closed" size={32} color="#3b82f6" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                                Access Required
                            </Text>
                            <Text className="text-gray-600 text-center leading-relaxed">
                                Please log in to view and manage your forms
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
            <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-6">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-3xl font-bold text-gray-800">
                        My Forms
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/createform')}
                        className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Ionicons name="add" size={20} color="white" />
                        <Text className="text-white font-medium ml-1">New</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-gray-600">
                    Manage and track your feedback forms ( Click on form to check stats )
                </Text>
            </View>

            <View className="flex-1 px-6 pt-6">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-gray-600 mt-4 text-center font-medium">
                                Loading your forms...
                            </Text>
                        </View>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center">
                        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
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
                                onPress={() => dispatch(fetchMyForms({ userId: user?.id }))}
                                className="bg-blue-600 py-3 px-6 rounded-lg"
                            >
                                <Text className="text-white font-semibold text-center">
                                    Try Again
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : forms.length > 0 ? (
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-700">
                                {forms.length} {forms.length === 1 ? 'Form' : 'Forms'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => dispatch(fetchMyForms({ userId: user?.id }))}
                                className="flex-row items-center"
                            >
                                <Ionicons name="refresh" size={18} color="#6b7280" />
                                <Text className="text-gray-500 ml-1 font-medium">Refresh</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={forms}
                            renderItem={renderForm}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            ItemSeparatorComponent={() => <View className="h-2" />}
                        />
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
                                <Text className="text-gray-600 text-center leading-relaxed mb-6">
                                    Create your first form to start collecting feedback from your audience
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
            </View>
        </View>
    );
}

export default ListFormComponent