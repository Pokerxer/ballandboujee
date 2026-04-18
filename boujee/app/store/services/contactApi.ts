import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface ContactFormData {
  name: string
  email: string
  subject: 'general' | 'collaboration' | 'press' | 'events'
  message: string
}

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://backend.ballandboujee.com/api',
  }),
  endpoints: (builder) => ({
    submitContact: builder.mutation<{ success: boolean; message: string }, ContactFormData>({
      query: (formData) => ({
        url: 'contact',
        method: 'POST',
        body: formData,
      }),
    }),
    subscribeNewsletter: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: ({ email }) => ({
        url: 'newsletter',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
})

export const { useSubmitContactMutation, useSubscribeNewsletterMutation } = contactApi