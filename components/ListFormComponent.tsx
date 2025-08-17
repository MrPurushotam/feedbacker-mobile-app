import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GenericFormView from './GenericFormView';
import { fetchMyForms } from '@/store/slice/formSlice';

const EmptyState = ({ icon, iconColor, title, message, buttonText, onPress }: any) => (
    <View className="flex-1 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-sm">
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name={icon} size={32} color={iconColor} />
                </View>
                <Text className="text-2xl font-bold text-gray-800 text-center mb-2">{title}</Text>
                <Text className="text-gray-600 text-center leading-relaxed">{message}</Text>
            </View>
            {onPress && (
                <TouchableOpacity onPress={onPress} className="bg-blue-600 py-3 px-6 rounded-lg shadow-sm">
                    <Text className="text-white font-semibold text-center text-lg">{buttonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    </View>
);

const ListFormComponent = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { user, isLoggedIn } = useSelector((state: any) => state.auth);
    const { forms, isLoading, error } = useSelector((state: any) => state.form);

    const handleRefresh = useCallback(() => {
        dispatch(fetchMyForms({ userId: user?.id }));
    }, [dispatch, user?.id]);

    const renderForm = ({ item }: { item: any }) => (
        <GenericFormView
            form={item}
            showDropDownMenu
            onEdit={(f) => router.push(`/form/edit/${f.id}`)}
            onStats={(f) => router.push(`/stats/${f.id}`)}
            onView={(f) => router.push(`/form/${f.id}`)}
        />
    );

    // Not Logged In
    if (!isLoggedIn) {
        return (
            <EmptyState
                icon="lock-closed"
                iconColor="#3b82f6"
                title="Access Required"
                message="Please log in to view and manage your forms"
                buttonText="Login to Continue"
                onPress={() => router.push('/login')}
            />
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-6">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-3xl font-bold text-gray-800">My Forms</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/form/createform')}
                        className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Ionicons name="add" size={20} color="white" />
                        <Text className="text-white font-medium ml-1">New</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-gray-600">
                    Manage and track your feedback forms (Click on form to check stats)
                </Text>
            </View>

            {/* Body */}
            <View className="flex-1 px-6 pt-6">
                {isLoading && (
                    <EmptyState
                        icon="cloud-download"
                        iconColor="#3b82f6"
                        title="Loading your forms..."
                        message=""
                    />
                )}

                {error && !isLoading && (
                    <EmptyState
                        icon="warning"
                        iconColor="#ef4444"
                        title="Something went wrong"
                        message={error}
                        buttonText="Try Again"
                        onPress={handleRefresh}
                    />
                )}

                {!isLoading && !error && forms.length > 0 && (
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-700">
                                {forms.length} {forms.length === 1 ? 'Form' : 'Forms'}
                            </Text>
                            <TouchableOpacity onPress={handleRefresh} className="flex-row items-center">
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
                )}

                {!isLoading && !error && forms.length === 0 && (
                    <EmptyState
                        icon="document-outline"
                        iconColor="#6b7280"
                        title="No Forms Yet"
                        message="Create your first form to start collecting feedback from your audience"
                        buttonText="Create Your First Form"
                        onPress={() => router.push('/form/createform')}
                    />
                )}
            </View>
        </View>
    );
};

export default ListFormComponent;
