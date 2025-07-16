import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { formType } from '@/types/formTypes'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { deleteForm } from '@/store/slice/formSlice';

interface DropdownOption {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

const GenericFormView = ({ form, showDropDownMenu=false }: { form: formType, showDropDownMenu?: boolean }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleFormPress = () => {
    console.log(`/track/${form.id}`);
    router.push(`/track/${form.id}`);
  };

  const handleShare = () => {
    // Implement share functionality
    Alert.alert('Share', `Share form: ${form.title}`);
    setShowDropdown(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Form',
      `Are you sure you want to delete "${form.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // @ts-ignore
            dispatch(deleteForm({ id: form.id }));
            setShowDropdown(false);
          }
        }
      ]
    );
  };

  const handleView = () => {
    // router.push(`/track/${form.id}`);
    setShowDropdown(false);
  };

  const handleStats = () => {
    router.push(`/track/${form.id}`);
    setShowDropdown(false);
  };

  const dropdownOptions: DropdownOption[] = [
    { id: 'view', label: 'View', icon: 'eye-outline', action: handleView },
    { id: 'share', label: 'Share', icon: 'share-outline', action: handleShare },
    { id: 'stats', label: 'Stats', icon: 'stats-chart-outline', action: handleStats },
    { id: 'delete', label: 'Delete', icon: 'trash-outline', action: handleDelete },
  ];

  return (
    <View className='w-full mb-3 relative'>
      <TouchableOpacity
        onPress={handleFormPress}
        className='w-full px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-100 flex-row items-center'
        activeOpacity={0.7}
      >
        <View className='w-12 h-12 bg-purple-500 rounded-lg items-center justify-center mr-3'>
          <Icon name="wpforms" size={20} color="#fff" />
        </View>

        <View className='flex-1 flex-col justify-center'>
          <Text
            className='text-lg font-semibold text-gray-800 mb-1'
            numberOfLines={1}
          >
            {form.title}
          </Text>
          <Text
            className='text-sm text-gray-600'
            numberOfLines={2}
          >
            {form.description}
          </Text>
        </View>

        {showDropDownMenu &&
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            className='w-8 h-8 items-center justify-center ml-2'
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons   
              name="ellipsis-vertical"
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        }
      </TouchableOpacity>

      {showDropdown && (
        <>
          <TouchableOpacity
            className='absolute top-0 left-0 right-0 bottom-0 z-10'
            onPress={() => setShowDropdown(false)}
            activeOpacity={1}
          />

          <View className='absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[120px]'>
            {dropdownOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.action}
                className={`flex-row items-center px-4 py-3 ${option.id === 'delete' ? 'border-t border-gray-100' : ''
                  }`}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={option.id === 'delete' ? '#ef4444' : '#6b7280'}
                />
                <Text
                  className={`ml-3 text-sm ${option.id === 'delete' ? 'text-red-500' : 'text-gray-700'
                    }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

export default GenericFormView