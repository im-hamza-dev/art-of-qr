// src/utils/printifyService.js
import axios from 'axios';

// Set up API client
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjA0ZjY5MjVhM2E4MDUyYjk1MjBjNzBmNDBlNDY5NTQxZjFiMmJiNDY0YWZjNTVlYThjYzA1ZTAwZTI0NmIwMjk1NDAxMTUxNzgwNDZhNzExIiwiaWF0IjoxNzI3NDYxNjk4LjUwMjczOSwibmJmIjoxNzI3NDYxNjk4LjUwMjc0MiwiZXhwIjoxNzU4OTk3Njk4LjQ5NjI3NSwic3ViIjoiMTk5ODg1OTgiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.AtN5V7sugdIrbrFJQkL5EhLiatBiMdEn6tGfn7nVaCxs254S3wtCKwv8Ebvgu1xXND8ExfDkUuWamgmL3NU'
const BASE_URL = 'https://api.printify.com/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Example: Get list of shops
export const getShops = async () => {
  try {
    const response = await axios.get('https://api.printify.com/v1/shops.read',
     { headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }},
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching shops:', error);
  }
};

// Add more API functions below...
