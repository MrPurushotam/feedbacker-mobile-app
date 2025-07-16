import CreateComponent from '@/components/create'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

const Signup = () => {
  const router = useRouter()
  const { isLoggedIn } = useSelector((state: any) => state.auth)

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard')
    }
  }, [isLoggedIn, router])

  if (isLoggedIn) {
    return null
  }

  return (
    <CreateComponent />
  )
}

export default Signup