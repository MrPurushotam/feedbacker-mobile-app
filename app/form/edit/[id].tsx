import React from 'react'
import EditForm from '@/components/EditFormComponent'
import { useLocalSearchParams } from 'expo-router'

const EditPage = () => {
  const { id } = useLocalSearchParams();
  return (
    <EditForm id={id} />
  )
}

export default EditPage;