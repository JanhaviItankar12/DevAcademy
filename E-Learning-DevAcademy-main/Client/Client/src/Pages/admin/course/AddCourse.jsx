import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCreateCourseMutation } from '@/features/api/courseApi'
import { toast } from 'sonner'




const AddCourse = () => {
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState({});

  const [createCourse, { data, error, isSuccess, isLoading, isError }] = useCreateCourseMutation();

  const getSelectedCategory = (value) => {
    setCategory(value);
    // Clear category error when user selects something
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!courseTitle.trim()) {
      newErrors.courseTitle = "Course title is required";
    } else if (courseTitle.trim().length < 3) {
      newErrors.courseTitle = "Course title must be at least 3 characters";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createCourseHandler = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      await createCourse({ courseTitle: courseTitle.trim(), category });
    } catch (err) {
      // This handles network errors or unexpected errors
      toast.error("Failed to create course. Please try again.");
    }
  };

  // Handle API responses
  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || "Course created successfully!");
      // Optional: clear form
      setCourseTitle("");
      setCategory("");
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/instructor/course");
      }, 1500);
    }
  }, [isSuccess, data, navigate]);

  // Handle API errors
  useEffect(() => {
    if (isError && error) {
      // Handle different error formats (RTK Query or custom)
      const errorMessage = error.data?.message ||
        error.error ||
        "Failed to create course";
      toast.error(errorMessage);

      // You can also set field-specific errors if your API returns them
      if (error.data?.errors) {
        setErrors(error.data.errors);
      }
    }
  }, [isError, error]);

  // Handle keyboard submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      createCourseHandler();
    }
  };

  return (
    <div className='flex-1 mx-10 mt-10'>
      <div className='mb-4'>
        <h1 className='font-bold text-2xl'>Let's add a course. Add some basic course details for your new course</h1>
        <p className='text-lg'>Easily expand your learning platform by adding a new course. Provide the course title, description, category, and other details to make it available to students. Whether it's a beginner-friendly tutorial or an advanced module, start building your course today and help learners grow their skills!</p>

        <div className='space-y-8 mt-8'>
          {/* Course Title Field */}
          <div className='space-y-2'>
            <Label htmlFor="courseTitle">
              Title *
            </Label>
            <Input
              id="courseTitle"
              type={'text'}
              value={courseTitle}
              name='courseTitle'
              onChange={(e) => {
                setCourseTitle(e.target.value);
                // Clear error when user types
                if (errors.courseTitle) {
                  setErrors(prev => ({ ...prev, courseTitle: '' }));
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder='Your Course Name'
              className={errors.courseTitle ? 'border-red-500' : ''}
            />
            {errors.courseTitle && (
              <p className="text-red-500 text-sm mt-1">{errors.courseTitle}</p>
            )}
          </div>

          {/* Category Field */}
          <div className='space-y-2'>
            <Label>
              Category *
            </Label>
            <Select
              value={category}
              onValueChange={getSelectedCategory}
            >
              <SelectTrigger className={`w-full ${errors.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="Next JS">Next JS</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                  <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                  <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="CSS">CSS</SelectItem>
                  <SelectItem value="TypeScript">TypeScript</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="C#">C#</SelectItem>
                  <SelectItem value="Tailwind CSS">Tailwind CSS</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Buttons */}
          <div className='flex items-center gap-2 pt-4'>
            <Button
              variant={'outline'}
              className={'cursor-pointer'}
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Back
            </Button>

            <Button
              disabled={isLoading || !courseTitle.trim() || !category}
              className="cursor-pointer min-w-[120px] h-10 flex items-center justify-center"
              onClick={createCourseHandler}
            >
              {isLoading ? (
                <>
                  <Loader2 size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCourse;