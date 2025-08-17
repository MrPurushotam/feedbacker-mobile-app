import { deleteForm } from '@/store/slice/formSlice';
import { formType } from '@/types/formTypes';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';

interface DropdownOption {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

type Props = {
  form: formType;
  showDropDownMenu?: boolean;
  onPress?: (form: formType) => void;
  onView?: (form: formType) => void;
  onStats?: (form: formType) => void;
  onShare?: (form: formType) => void;
  onEdit?: (form: formType) => void;
};


const GenericFormView = ({ form, showDropDownMenu = false, onPress, onView, onStats, onShare, onEdit }: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { genericLoading } = useSelector((state: any) => state.form);

  const handleFormPress = () => {
    if (showDropDownMenu) return;
    router.push(`/stats/${form.id}`);
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

  const handleEditForm = () => {
    onEdit?.(form);
    setShowDropdown(false);
  }

  const handleView = () => {
    onView?.(form);
    setShowDropdown(false);
  };

  const handleStats = () => {
    onStats?.(form);
    setShowDropdown(false);
  };

  const dropdownOptions: DropdownOption[] = [
    { id: 'view', label: 'View', icon: 'eye-outline', action: handleView },
    { id: 'share', label: 'Share', icon: 'share-outline', action: handleShare },
    { id: 'stats', label: 'Stats', icon: 'stats-chart-outline', action: handleStats },
    { id: 'edit', label: 'Edit', icon: 'create-outline', action: handleEditForm },
    { id: 'delete', label: 'Delete', icon: 'trash-outline', action: handleDelete },
  ];

  return (
    <View className='w-full mb-3 relative'>
      <TouchableOpacity
        onPress={handleFormPress}
        className='w-full px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-100 flex-row items-center'

      >
        <View className="bg-blue-100 p-3 rounded-lg mr-3">
          <MaterialIcons name="description" size={24} color="#2563eb" />
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
            {dropdownOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.action}
                className={`flex-row items-center px-4 py-3 ${option.id === 'delete' ? 'border-t border-gray-100' : ''
                  }`}
                disabled={option.id === 'delete' && genericLoading}
              >
                {option.id === 'delete' && genericLoading ? (
                  <Ionicons name="refresh" size={16} color="#ef4444" style={{ marginRight: 12 }} />
                ) : (
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={option.id === 'delete' ? '#ef4444' : '#6b7280'}
                  />
                )}
                <Text
                  className={`ml-3 text-sm ${option.id === 'delete' ? 'text-red-500' : 'text-gray-700'
                    }`}
                >
                  {option.id === 'delete' && genericLoading ? 'Deleting...' : option.label}
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