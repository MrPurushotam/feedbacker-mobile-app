import { api } from '@/libs/api';
import { Ionicons } from '@expo/vector-icons';
import { updateAuthState } from "@/store/slice/authSlice";
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

interface DataType {
    fullname: string;
    email: string;
    password: string;
}

const LoginComponent = () => {
    const router = useRouter();
    const [data, setData] = useState<DataType>({
        fullname: "",
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<DataType>>({});
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const validateForm = (): boolean => {
        const newErrors: Partial<DataType> = {};
        if (!data.fullname) {
            newErrors.fullname = 'Full name is required';
        } else if (data.fullname.length < 3 || !/^[a-zA-Z\s]{3,}$/.test(data.fullname)) {
            newErrors.fullname = 'Full name must be at least 3 characters and contain only letters and spaces';
        }

        if (!data.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!data.password) {
            newErrors.password = 'Password is required';
        } else if (data.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePress = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const resp = await api.post("/user/create", data);
            if (resp.data.success) {
                const payload = {
                    token: resp.data.token,
                    user: resp.data.user,
                }
                dispatch(updateAuthState(payload))
                router.push("/dashboard");
                return;
            }
            Alert.alert("Login Failed", resp.data.message || "Invalid credentials");
        } catch (error: any) {
            console.log("Error occured while logging ", error);
            Alert.alert("Error", error.response?.data?.message || "Network error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    const updateField = (field: keyof DataType, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <View className='w-full h-full flex justify-center items-center bg-gray-50 px-6'>
            <SafeAreaView className='w-full max-w-md bg-white p-10 rounded-2xl shadow-xl'>
                <View className='mb-12 items-center'>
                    <Text className="text-4xl font-bold text-gray-800 mb-3">
                        <Text className="text-blue-600">Feed</Text>backer
                    </Text>
                    <Text className="text-gray-500 text-lg">Create your account now</Text>
                </View>

                <View>
                    <View className='mb-6'>
                        <TextInput
                            placeholder='Fullname'
                            className={`border rounded-2xl p-5 text-lg bg-gray-50 ${errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                                }`}
                            autoCorrect={true}
                            value={data?.fullname}
                            onChangeText={(text) => updateField('fullname', text)}
                            editable={!loading}
                        />
                        {errors.fullname && (
                            <Text className="text-red-500 text-base mt-3 ml-2">{errors.fullname}</Text>
                        )}
                    </View>

                    <View className='mb-6'>
                        <TextInput
                            placeholder='Email'
                            className={`border rounded-2xl p-5 text-lg bg-gray-50 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                                }`}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={data?.email}
                            onChangeText={(text) => updateField('email', text)}
                            editable={!loading}
                        />
                        {errors.email && (
                            <Text className="text-red-500 text-base mt-3 ml-2">{errors.email}</Text>
                        )}
                    </View>

                    <View className='mb-6'>
                        <View className={`flex-row items-center px-4 py-3 border rounded-2xl bg-gray-50 ${errors.password ? "border-red-500" : "border-gray-200"}`}>
                            <TextInput
                                placeholder='Password'
                                className={`flex-1 text-lg bg-transparent`}
                                secureTextEntry={!showPassword}
                                value={data?.password}
                                onChangeText={(text) => updateField('password', text)}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                className='pr-6'
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text className="text-red-500 text-base mt-3 ml-2">{errors.password}</Text>
                        )}
                    </View>

                </View>

                <TouchableOpacity
                    className={`w-full py-5 rounded-2xl items-center mt-10 shadow-lg ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
                    onPress={handlePress}
                    disabled={loading}
                >
                    <View className='flex-row items-center'>
                        {loading && <ActivityIndicator color="white" size="small" className='mr-3' />}
                        <Text className='text-white text-xl font-semibold'>
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View className='mt-8 items-center py-3'>
                    <Text className="text-gray-600 text-lg">
                        Have an account?{' '}
                        <Link href={"/login"} className="underline text-blue-600 font-semibold">Login</Link>
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default LoginComponent