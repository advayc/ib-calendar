'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '@/types';

interface CourseContextType {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  toggleCourse: (courseId: string) => void;
  enabledCourseIds: string[];
  selectedGrade: 'all' | 'DP1' | 'DP2';
  setSelectedGrade: (grade: 'all' | 'DP1' | 'DP2') => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
  initialCourses: Course[];
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ 
  children, 
  initialCourses 
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedGrade, setSelectedGrade] = useState<'all' | 'DP1' | 'DP2'>('all');

  // Load enabled states from localStorage on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('gfs-enabled-courses');
      if (saved) {
        const enabledIds = JSON.parse(saved) as string[];
        setCourses(prev => prev.map(course => ({
          ...course,
          enabled: enabledIds.includes(course.id)
        })));
      }
    } catch (err) {
      console.error('Failed to load course preferences:', err);
    }
  }, []);

  // Keep internal courses in sync when parent provides new course list
  React.useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  // Save enabled states to localStorage whenever courses change
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const enabledIds = courses.filter(c => c.enabled).map(c => c.id);
      localStorage.setItem('gfs-enabled-courses', JSON.stringify(enabledIds));
    } catch (err) {
      console.error('Failed to save course preferences:', err);
    }
  }, [courses]);

  const toggleCourse = (courseId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, enabled: !course.enabled } : course
      )
    );
  };

  const enabledCourseIds = courses
    .filter(course => {
      if (!course.enabled) return false;
      if (selectedGrade === 'all') return true;
      return course.grade === selectedGrade;
    })
    .map(course => course.id);

  return (
    <CourseContext.Provider value={{ 
      courses, 
      setCourses, 
      toggleCourse, 
      enabledCourseIds,
      selectedGrade,
      setSelectedGrade
    }}>
      {children}
    </CourseContext.Provider>
  );
};

// Legacy exports for backwards compatibility during migration
export const ClubProvider = CourseProvider;
export const useClubs = useCourses;
export const ClubContext = CourseContext;
