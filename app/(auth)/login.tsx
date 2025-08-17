import React, { useEffect } from 'react'
import LoginComponent from '@/components/login'
import { useSelector } from 'react-redux'
import { useRouter } from 'expo-router'

const Login = () => {
  const router = useRouter();
  const { isLoggedIn } = useSelector((state: any) => state.auth)
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router])

  if (isLoggedIn) return null;

  return (
    <LoginComponent />
  )
}

export default Login