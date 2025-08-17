import { Text, View, ActivityIndicator } from "react-native";
import "./global.css"
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-50 to-white px-8">
      <View className="items-center space-y-8">
        <View className="items-center mb-8">
          <Text className="text-6xl font-bold text-gray-800 mb-4">
            <Text className="text-blue-600">Feed</Text>backer
          </Text>
          <Text className="text-xl text-gray-500 text-center leading-relaxed">
            Collect feedback{'\n'}Build better products
          </Text>
        </View>

        <View className="items-center space-y-4">
          <Text className="text-2xl font-semibold text-gray-700">
            Welcome
          </Text>
          <Text className="text-lg text-gray-500 text-center">
            Get ready to revolutionize your feedback collection
          </Text>
        </View>

        {/* Loading Indicator */}
        <View className="mt-12 items-center space-y-4">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-400 text-base">
            Loading your experience...
          </Text>
        </View>
      </View>
    </View>
  );
}
