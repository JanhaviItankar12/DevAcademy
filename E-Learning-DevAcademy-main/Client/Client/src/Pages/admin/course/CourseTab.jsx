import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditCourseMutation, useGetCourseByIdQuery, useRemoveCourseMutation, useTogglePublishCourseMutation } from '@/features/api/courseApi';
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const CourseTab = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId;

  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: ""
  });

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const [editCourse, { data, isLoading, isSuccess, isError }] = useEditCourseMutation();
  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } = useGetCourseByIdQuery(courseId);
  const [togglePublishCourse, { isLoading: isPublishLoading }] = useTogglePublishCourseMutation();
  const [removeCourse, { isLoading: isRemoveLoading }] = useRemoveCourseMutation();

  console.log(courseByIdData);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value })
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value })
  }
  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value })
  }
  
  // Get file
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  }

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description || " ");
    
    formData.append("courseThumbnail", input.courseThumbnail);
    await editCourse({ formData, courseId });
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course updated.")
      refetch(); // Refetch to update the data after successful edit
    }
    if (isError) {
      toast.error(data?.message || "Failed to update");
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData?.course;
      
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: course.courseThumbnail || ""
      });
      
      // Auto-display existing thumbnail
      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);
      }
    }
  }, [courseByIdData]);

  if (courseByIdLoading) return <h1>Loading...</h1>

  // Enhanced validation function that includes lecture validation
  const validateCourseForPublish = () => {
    const course = courseByIdData?.course;
    const errors = [];

    // Basic course info validation - using safe checks
    if (!input.courseTitle || input.courseTitle.trim() === "") {
      errors.push("Course title is required");
    }
    if (!input.subTitle || input.subTitle.trim() === "") {
      errors.push("Subtitle is required");
    }
    if (!input.description || input.description.trim() === "" || input.description.trim() === "<p></p>") {
      errors.push("Description is required");
    }
    if (!input.category || input.category.trim() === "") {
      errors.push("Category is required");
    }
    if (!input.courseLevel || input.courseLevel.trim() === "") {
      errors.push("Course level is required");
    }
    
    // Safely check course price
    const price = Number(input.coursePrice);
    if (!input.coursePrice || isNaN(price) || price <= 0) {
      errors.push("Valid course price is required");
    }
    
    // Safely check if thumbnail exists
    const hasThumbnail = input.courseThumbnail && (
      (typeof input.courseThumbnail === 'string' && input.courseThumbnail.trim() !== "") ||
      (input.courseThumbnail instanceof File)
    );
    
    if (!hasThumbnail) {
      errors.push("Course thumbnail is required");
    }

    // Lecture validation - check if course has at least one lecture
    if (!course?.lectures || course.lectures.length === 0) {
      errors.push("At least one lecture is required");
    } else {
      // Safely check each lecture for required video URL
      const invalidLectures = course.lectures.filter(lecture => {
        // Check if lecture.videoUrl exists and is not empty
        if (!lecture?.videoUrl) return true;
        
        // Handle both string and other types safely
        if (typeof lecture.videoUrl === 'string') {
          return lecture.videoUrl.trim() === "";
        }
        
        // For non-string values, consider it invalid
        return true;
      });
      
      if (invalidLectures.length > 0) {
        // Safely get lecture titles
        const lectureTitles = invalidLectures.map(l => {
          if (l?.lectureTitle && typeof l.lectureTitle === 'string') {
            return l.lectureTitle;
          }
          return 'Untitled';
        });
        errors.push(`Lecture(s) without video: ${lectureTitles.join(', ')}`);
      }

      // Check if any lecture has an empty title
      const lecturesWithoutTitle = course.lectures.filter(lecture => {
        if (!lecture?.lectureTitle) return true;
        
        if (typeof lecture.lectureTitle === 'string') {
          return lecture.lectureTitle.trim() === "";
        }
        
        return true;
      });
      
      if (lecturesWithoutTitle.length > 0) {
        errors.push(`Lecture title is required for all lectures`);
      }
    }

    return errors;
  };

  const publishStatusHandler = async (action) => {
    // Always validate before publishing
    if (action === "true") {
      const validationErrors = validateCourseForPublish();
      
      if (validationErrors.length > 0) {
        // Show all validation errors
        validationErrors.forEach(error => {
          toast.error(error);
        });
        return;
      }
    }

    setIsPublishing(true);
    try {
      const response = await togglePublishCourse({ courseId, query: action }).unwrap();
      toast.success(response?.message || `Course ${action === "true" ? "published" : "unpublished"} successfully`);
      refetch(); // Refetch to update publish status
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(error?.data?.message || `Failed to ${action === "true" ? "publish" : "unpublish"} course`);
    } finally {
      setIsPublishing(false);
    }
  }

  const removeCourseHandler = async () => {
    // Confirm before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this course? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const result = await removeCourse(courseId).unwrap();
      toast.success(result?.message || "Course removed successfully");
      navigate("/instructor/course");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error?.data?.message || "Failed to remove course");
    }
  }

  // Check if course is ready to publish
  const validationErrors = validateCourseForPublish();
  const isReadyToPublish = validationErrors.length === 0;

  // Helper function to count lectures with video URLs
  const getLectureStats = () => {
    if (!courseByIdData?.course?.lectures) return { total: 0, withVideo: 0 };
    
    const lectures = courseByIdData.course.lectures;
    const withVideo = lectures.filter(lecture => {
      if (!lecture?.videoUrl) return false;
      
      if (typeof lecture.videoUrl === 'string') {
        return lecture.videoUrl.trim() !== "";
      }
      
      return false;
    }).length;
    
    return { total: lectures.length, withVideo };
  };

  const lectureStats = getLectureStats();

  // Helper function to safely check if a value is empty
  const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === "";
    if (value instanceof File) return false; // File object is not empty
    return true;
  };

  // Safely check if thumbnail has value
  const hasThumbnail = input.courseThumbnail && (
    (typeof input.courseThumbnail === 'string' && input.courseThumbnail.trim() !== "") ||
    (input.courseThumbnail instanceof File)
  );

  return (
    <Card>
      <CardHeader className={'flex flex-row justify-between'}>
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make changes to your courses here. Click save when you're done.
          </CardDescription>
        </div>
        <div className='space-x-4'>
          <Button 
            variant={'outline'} 
            disabled={(!isReadyToPublish && !courseByIdData?.course.isPublished) || isPublishLoading || isPublishing} 
            className={'cursor-pointer min-w-[120px]'} 
            onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
          >
            {isPublishLoading || isPublishing ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button 
            className={'mt-4 cursor-pointer min-w-[140px]'} 
            onClick={removeCourseHandler}
            variant="destructive"
            disabled={isRemoveLoading}
          >
            {isRemoveLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Trash2 className='mr-2 h-4 w-4' />
            )}
            Remove Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Course Status Summary */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Course Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Published: </span>
              <span className={courseByIdData?.course.isPublished ? "text-green-600" : "text-gray-600"}>
                {courseByIdData?.course.isPublished ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="font-medium">Lectures: </span>
              <span className={lectureStats.total > 0 ? "text-green-600" : "text-red-600"}>
                {lectureStats.total} total
              </span>
            </div>
            <div>
              <span className="font-medium">Lectures with Video: </span>
              <span className={lectureStats.withVideo === lectureStats.total && lectureStats.total > 0 ? "text-green-600" : "text-red-600"}>
                {lectureStats.withVideo}/{lectureStats.total}
              </span>
            </div>
            <div>
              <span className="font-medium">Ready to Publish: </span>
              <span className={isReadyToPublish ? "text-green-600" : "text-red-600"}>
                {isReadyToPublish ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Validation Alert */}
        {!isReadyToPublish && !courseByIdData?.course.isPublished && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Course cannot be published</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Please fix the following issues:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className='space-y-4 mt-5'>
          <div className='space-y-3'>
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input
              type={'text'}
              name='courseTitle'
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack Developer"
              className={isEmpty(input.courseTitle) ? "border-red-300" : ""}
            />
          </div>
          <div className='space-y-3'>
            <Label>SubTitle <span className="text-red-500">*</span></Label>
            <Input
              type={'text'}
              name='subTitle'
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Become a Fullstack Developer from Zero to Hero"
              className={isEmpty(input.subTitle) ? "border-red-300" : ""}
            />
          </div>
          <div className="space-y-3">
  <Label>
    Description <span className="text-red-500">*</span>
  </Label>

  <RichTextEditor
  value={input.description}
  setValue={(html) =>
    setInput((prev) => ({
      ...prev,
      description: html,
    }))
  }
/>


  {(isEmpty(input.description) || input.description === "<p></p>") && (
    <p className="text-sm text-red-500">Description is required</p>
  )}
</div>

          <div className='flex items-center gap-5'>
            <div className='space-y-3'>
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select onValueChange={selectCategory} value={input.category}>
                <SelectTrigger className={`w-[240px] ${isEmpty(input.category) ? "border-red-300" : ""}`}>
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
            </div>
            <div className='space-y-3'>
              <Label>Course Level <span className="text-red-500">*</span></Label>
              <Select onValueChange={selectCourseLevel} value={input.courseLevel}>
                <SelectTrigger className={`w-[240px] ${isEmpty(input.courseLevel) ? "border-red-300" : ""}`}>
                  <SelectValue placeholder="Select a course level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Course Level</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-3'>
              <Label>Price in (INR) <span className="text-red-500">*</span></Label>
              <Input 
                type={'number'} 
                name='coursePrice' 
                value={input.coursePrice} 
                onChange={changeEventHandler} 
                placeholder='199' 
                className={`w-fit ${(!input.coursePrice || isNaN(Number(input.coursePrice)) || Number(input.coursePrice) <= 0) ? "border-red-300" : ""}`} 
              />
            </div>
          </div>
          <div className='space-y-3'>
            <Label>Course Thumbnail <span className="text-red-500">*</span></Label>
            <Input 
              type={'file'} 
              accept="image/*" 
              className={`w-fit ${!hasThumbnail ? "border-red-300" : ""}`} 
              onChange={selectThumbnail} 
            />
            {previewThumbnail && (
              <img 
                src={previewThumbnail} 
                alt="Course Thumbnail" 
                className='w-64 my-2 rounded-md border' 
              />
            )}
            {!hasThumbnail && (
              <p className="text-sm text-red-500">Course thumbnail is required</p>
            )}
          </div>
          
          {/* Lecture Status Alert */}
          {lectureStats.total === 0 ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Lectures Found</AlertTitle>
              <AlertDescription>
                You need to add at least one lecture before publishing the course.
              </AlertDescription>
            </Alert>
          ) : lectureStats.withVideo < lectureStats.total ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Incomplete Lectures</AlertTitle>
              <AlertDescription>
                {lectureStats.total - lectureStats.withVideo} of {lectureStats.total} lecture(s) are missing video URLs.
                All lectures must have video URLs to publish the course.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Lectures Complete</AlertTitle>
              <AlertDescription className="text-green-700">
                All {lectureStats.total} lectures have video URLs.
              </AlertDescription>
            </Alert>
          )}
          
          <div className='flex items-center gap-2 mt-3'>
            <Button 
              variant={'outline'} 
              onClick={() => navigate(-1)} 
              className={'cursor-pointer'}
            >
              Cancel
            </Button>
            <Button 
              disabled={isLoading} 
              onClick={updateCourseHandler} 
              className={'cursor-pointer'}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseTab