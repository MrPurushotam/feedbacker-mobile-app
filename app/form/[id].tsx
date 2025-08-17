import React from 'react'
import ViewPublicForm from '@/components/ViewPublicForm'
import { useLocalSearchParams } from 'expo-router';

const ViewForm = () => {
  const { id } = useLocalSearchParams();
  return (
    <ViewPublicForm id={id} />
  )
}

export default ViewForm