import { Stack } from "expo-router";
import { Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { ReduxStore } from "../store/store";

export default function RootLayout() {
  return (
    <Provider store={ReduxStore}>
      <Stack
        screenOptions={{
          headerTransparent: true,
          header: () => (
            <View style={{ 
              height: 70, 
              backgroundColor:"white", 
              alignItems: 'center', 
              justifyContent: 'center', 
             padding: 16,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', letterSpacing: 0.25 }}>
                <Text style={{ color: '#2563eb' }}>Feed</Text>backer
              </Text>
            </View>
          ),
          contentStyle: { backgroundColor: 'transparent' },
          statusBarHidden: true,
        }}
      />
    </Provider>
  );
}