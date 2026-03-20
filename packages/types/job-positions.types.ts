export interface JobPosition {
  id: string;
  name: string;
  description?: string;
}

export interface CreateJobPositionDto {
  name: string;
  description?: string;
}

export interface UpdateJobPositionDto {
  name?: string;
  description?: string;
}
