import { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';

export const BACKEND_URL = 'localhost:8000';

interface CustomSkeletonProps {
  width: string;
  height: number;
  animation?: 'wave' | 'pulse';
  borderRadius?: string;
  margin?: string;
}

export const CustomSkeleton: FC<CustomSkeletonProps> = ({
  width,
  height,
  animation = 'wave',
  borderRadius = '8px',
  margin = '0px',
}) => (
  <Skeleton
    variant='rectangular'
    width={width}
    height={height}
    animation={animation}
    style={{ borderRadius, margin }}
  />
);
