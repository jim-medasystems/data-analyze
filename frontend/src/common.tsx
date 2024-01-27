import { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';

// for local environments, it is usually localhost:8000 by default
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
