from pydantic import BaseModel
from typing import List, TypeVar, Generic, Optional
from datetime import datetime

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool

    @classmethod
    def create(cls, data: List[T], total: int, page: int, page_size: int):
        total_pages = (total + page_size - 1) // page_size
        return cls(
            data=data,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1,
        )


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    errors: Optional[List[str]] = None


class ErrorDetail(BaseModel):
    field: Optional[str]
    message: str
    code: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: List[ErrorDetail]
    timestamp: datetime


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None


class UploadResponse(BaseModel):
    file_url: str
    file_name: str
    file_size: int
    mime_type: str


class BulkOperationResult(BaseModel):
    total: int
    succeeded: int
    failed: int
    errors: List[dict]


class DashboardMetric(BaseModel):
    label: str
    value: float
    change: Optional[float] = None  # Percentage change
    change_label: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class DashboardChartData(BaseModel):
    labels: List[str]
    datasets: List[dict]


class ActivityLog(BaseModel):
    id: str
    action: str
    description: str
    user: Optional[str]
    timestamp: datetime
    icon: Optional[str] = None
