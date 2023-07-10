import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const baseURL = import.meta.env.VITE_API_URL!;

const axiosInstance = axios.create({
  baseURL,
});

export const sendRequest = async (url: string, method = 'GET', data = {}) => {
  const { getHeader } = useAuth();

  return await axiosInstance.request({
    url,
    method,
    headers: {
      authorization: getHeader(),
    },
    data,
  });
};
