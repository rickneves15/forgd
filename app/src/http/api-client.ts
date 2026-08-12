import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

import { storageKeys } from '@/utils/storage-keys'

const baseURL = process.env.EXPO_PUBLIC_API_URL

if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Create a .env file (see .env.example).',
  )
}

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
})

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync(storageKeys.accessToken)

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})
