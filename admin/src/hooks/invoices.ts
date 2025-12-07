import axios from "axios";
import { Invoice, CreateInvoiceRequest } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getInvoices = async (token: string): Promise<Invoice[]> => {
  const { data } = await axios.get(`${API_URL}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getInvoice = async (token: string, id: string): Promise<Invoice> => {
  const { data } = await axios.get(`${API_URL}/invoices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createInvoice = async (token: string, invoice: CreateInvoiceRequest): Promise<Invoice> => {
  const { data } = await axios.post(`${API_URL}/invoices`, invoice, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateInvoice = async (token: string, id: string, invoice: Partial<CreateInvoiceRequest>): Promise<Invoice> => {
  const { data } = await axios.put(`${API_URL}/invoices/${id}`, invoice, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const deleteInvoice = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_URL}/invoices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
