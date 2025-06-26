import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../shared/types';

export class ApiResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode = 500, error?: string): void {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response, 
    data: T[], 
    page: number, 
    limit: number, 
    total: number,
    message?: string
  ): void {
    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
    res.status(200).json(response);
  }

  static notFound(res: Response, resource = 'Resource'): void {
    this.error(res, `${resource} not found`, 404);
  }

  static badRequest(res: Response, message: string): void {
    this.error(res, message, 400);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): void {
    this.error(res, message, 403);
  }
}
