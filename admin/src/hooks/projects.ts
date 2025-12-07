import axios from "axios";
import { Project, CreateProjectRequest } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getProjects = async (token: string): Promise<Project[]> => {
  const { data } = await axios.get(`${API_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getUserProjects = async (token: string): Promise<Project[]> => {
  const { data } = await axios.get(`${API_URL}/projects/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getProject = async (token: string, id: string): Promise<Project> => {
  const { data } = await axios.get(`${API_URL}/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getProjectsByStatus = async (token: string, status: string): Promise<Project[]> => {
  const { data } = await axios.get(`${API_URL}/projects/status/${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const createProject = async (token: string, project: CreateProjectRequest): Promise<Project> => {
  const { data } = await axios.post(`${API_URL}/projects`, project, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateProject = async (token: string, id: string, project: Partial<CreateProjectRequest>): Promise<Project> => {
  const { data } = await axios.put(`${API_URL}/projects/${id}`, project, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const assignUsersToProject = async (token: string, id: string, userIds: string[]): Promise<Project> => {
  const { data } = await axios.post(
    `${API_URL}/projects/${id}/assign-users`,
    { userIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const deleteProject = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_URL}/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
