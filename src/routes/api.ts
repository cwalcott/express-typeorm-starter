import { Request, Response } from 'express';

type ApiResponse<T> =
  | { success: true; status: 200 | 201; data: T }
  | { success: true; status: 204; data?: never }
  | { success: false; status: 400 | 401 | 403 | 404 | 422 | 500; error: string };

export function handleApiResponse<T>(handler: (req: Request) => Promise<ApiResponse<T>>) {
  return async (req: Request, res: Response) => {
    const response = await handler(req);

    if (response.success) {
      if (response.data) {
        res.status(response.status).json(response.data);
      } else {
        res.status(response.status).send();
      }
    } else {
      res.status(response.status).json({ error: response.error });
    }
  };
}
