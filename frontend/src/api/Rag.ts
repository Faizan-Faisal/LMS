// src/api/rag.ts
import axios from 'axios';

const RAG_BASE_URL = 'http://localhost:7000/api'; // Port of RAG FastAPI

// Upload course material to Pinecone
export const processMaterial = (file: File, subject: string) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${RAG_BASE_URL}/process-material?subject=${encodeURIComponent(subject)}`, formData);
};

// Ask a question to the RAG system
export const askQuestion = (subject: string, question: string) =>
  axios.post(`${RAG_BASE_URL}/ask-question`, { subject, question });

// Get list of all RAG subjects
export const getSubjects = () => axios.get(`${RAG_BASE_URL}/subjects`);
