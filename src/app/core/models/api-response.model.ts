/**
 * Respuesta paginada genérica del backend.
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

/**
 * Estructura de error retornada por la API REST.
 */
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}
