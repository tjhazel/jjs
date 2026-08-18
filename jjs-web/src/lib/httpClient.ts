import axios, { type AxiosRequestConfig, AxiosError, type Method } from 'axios';

export const HttpVerb = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;
export type HttpVerb = typeof HttpVerb[keyof typeof HttpVerb];

export interface HttpError {
  httpErrorCode?: string;
  responseStatus?: number;
  responseData?: unknown;
  message: string;
}

export const handleError = (err: AxiosError): HttpError => {
  const error: HttpError = { httpErrorCode: err.code, message: err.message };
  console.error('HTTP Client Error Intercepted:', {
    code: err.code,
    message: err.message,
    status: err.response?.status,
    url: err.config?.url
  });

  if (err.response) {
    let rawData = '';
    try { rawData = err.response.data ? JSON.stringify(err.response.data).trim() : ''; } catch {}
    error.httpErrorCode = err.code;
    error.responseStatus = err.response.status;
    error.responseData = err.response.data;
    error.message = `[${err.response.status}] ${err.message}${rawData.length > 2 ? ': ' + rawData : ''}`;
  } else if (err.request) {
    error.message += ` Client never received a response, or request never left.`;
  } else {
    error.message += ` Unable to process request.`;
  }
  return error;
};

const getConfig = async (
  getToken?: () => Promise<string>,
  configOptions?: AxiosRequestConfig
): Promise<AxiosRequestConfig> => {
  const options: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    timeout: 300000
  };

  if (typeof getToken === 'function') {
    const accessToken = await getToken();
    if (accessToken) {
      options.headers = { ...options.headers, 'Authorization': `Bearer ${accessToken}` };
    }
  }

  return configOptions ? { ...options, ...configOptions } : options;
};

const request = async <T>(
  method: Method,
  url: string,
  getToken: () => Promise<string>,
  body?: object,
  extraConfig?: AxiosRequestConfig
): Promise<T> => {
  try {
    const baseConfig = await getConfig(getToken, extraConfig);
    const response = await axios({ method, url, data: body, ...baseConfig });
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

export const httpGet = async <T>(url: string, getToken: () => Promise<string>): Promise<T> => {
  return request<T>('GET', url, getToken);
};
export const httpPost = async <T>(url: string, getToken: () => Promise<string>, body?: object): Promise<T> => {
  return request<T>('POST', url, getToken, body);
};
export const httpPut = async <T>(url: string, getToken: () => Promise<string>, body?: object): Promise<T> => {
  return request<T>('PUT', url, getToken, body);
};
export const httpPatch = async <T>(url: string, getToken: () => Promise<string>, body?: object): Promise<T> => {
  return request<T>('PATCH', url, getToken, body);
};
export const httpDelete = async <T>(url: string, getToken: () => Promise<string>): Promise<T> => {
  return request<T>('DELETE', url, getToken);
};

export const httpGetByteUrl = async (
  url: string,
  getToken: () => Promise<string>,
  mediaType: string = 'application/pdf'
): Promise<string> => {
  try {
    const fileConfig = await getConfig(getToken, { responseType: 'blob' });
    const response = await axios.get(url, fileConfig);
    const file = new Blob([response.data], { type: mediaType });
    return URL.createObjectURL(file);
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

export const httpPostFormData = async <T>(
  url: string,
  getToken: () => Promise<string>,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> => {
  try {
    const token = await getToken();
    const response = await axios.post<T>(url, formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      timeout: 300000,
      onUploadProgress: (progressEvent: ProgressEvent) => {
        if (progressEvent.total && progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          try { if (typeof onProgress === 'function') onProgress(percent); } catch {}
        }
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error as AxiosError);
  }
};

export type TGet = <T>(url: string, options?: object) => Promise<T>;
export type TPatch = <T>(url: string, body?: object) => Promise<T>;
export type TPost = <T>(url: string, body?: object) => Promise<T>;
export type TPut = <T>(url: string, body?: object) => Promise<T>;
export type TDelete = <T>(url: string) => Promise<T>;
export type TPostFormData = <T>(url: string, formData: FormData, onProgress?: (percent: number) => void) => Promise<T>;
