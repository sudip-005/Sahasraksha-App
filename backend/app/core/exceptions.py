from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from .logging import logger

class StationNotFoundException(HTTPException):
    def __init__(self, station_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station '{station_id}' not found."
        )

class InsufficientSamplingException(HTTPException):
    def __init__(self, detail: str = "Insufficient sampling window for analysis (requires >= 24 hours)."):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )

async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP exception on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail, "path": request.url.path}
    )

async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": True, "message": "An internal server error occurred.", "details": str(exc)}
    )
