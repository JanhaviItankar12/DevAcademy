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
import { Loader2, AlertCircle, Trash2, ChevronDown, ChevronUp, Save, X, Menu } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [editCourse, { data, isLoading, isSuccess, isError }] = useEditCourseMutation();
  const { data: courseByIdData, isLoading: courseByIdLoading, refetch } = useGetCourseByIdQuery(courseId);
  const [togglePublishCourse, { isLoading: isPublishLoading }] = useTogglePublishCourseMutation();
  const [removeCourse, { isLoading: isRemoveLoading }] = useRemoveCourseMutation();

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

  if (courseByIdLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>

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

  // Mobile Action Menu
  const MobileActionMenu = () => (
    <div className="lg:hidden fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {isMobileMenuOpen && (
          <div className="bg-white rounded-xl shadow-2xl border p-3 mb-3 animate-slideUp w-52">
            <div className="flex flex-col gap-2">
              <Button
                onClick={updateCourseHandler}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button
                onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
                disabled={(!isReadyToPublish && !courseByIdData?.course.isPublished) || isPublishLoading || isPublishing}
                variant="outline"
                className="w-full justify-start"
              >
                {isPublishLoading || isPublishing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button
                onClick={removeCourseHandler}
                variant="destructive"
                disabled={isRemoveLoading}
                className="w-full justify-start"
              >
                {isRemoveLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remove Course
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="w-full justify-start"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Action Menu */}
      <MobileActionMenu />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Card className="w-full">
        <CardHeader className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="w-full">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl">Basic Course Information</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Make changes to your courses here. Click save when you're done.
            </CardDescription>
          </div>

          {/* Mobile Action Buttons (Visible on mobile & tablet) */}
          <div className="lg:hidden w-full mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                disabled={(!isReadyToPublish && !courseByIdData?.course.isPublished) || isPublishLoading || isPublishing}
                className="cursor-pointer flex-1"
                onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
              >
                {isPublishLoading || isPublishing ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button
                className="cursor-pointer flex-1"
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
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex space-x-4">
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
              className={'cursor-pointer min-w-[140px]'}
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

        <CardContent className="p-4 sm:p-6">
          {/* Course Status Summary */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-base sm:text-lg">Course Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="flex flex-col">
                <span className="font-medium">Published: </span>
                <span className={courseByIdData?.course.isPublished ? "text-green-600 font-semibold" : "text-gray-600"}>
                  {courseByIdData?.course.isPublished ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Lectures: </span>
                <span className={lectureStats.total > 0 ? "text-green-600 font-semibold" : "text-red-600"}>
                  {lectureStats.total} total
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">With Video: </span>
                <span className={lectureStats.withVideo === lectureStats.total && lectureStats.total > 0 ? "text-green-600 font-semibold" : "text-red-600"}>
                  {lectureStats.withVideo}/{lectureStats.total}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Ready to Publish: </span>
                <span className={isReadyToPublish ? "text-green-600 font-semibold" : "text-red-600"}>
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
              <AlertDescription className="mt-2">
                <p className="mb-2">Please fix the following issues:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mt-5">
            <div className="space-y-2">
              <Label className="text-lg sm:text-base">Title <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="courseTitle"
                value={input.courseTitle}
                onChange={changeEventHandler}
                placeholder="Ex. Fullstack Developer"
                className={`w-full text-lg ${isEmpty(input.courseTitle) ? "border-red-300" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-lg sm:text-base">SubTitle <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                name="subTitle"
                value={input.subTitle}
                onChange={changeEventHandler}
                placeholder="Ex. Become a Fullstack Developer from Zero to Hero"
                className={`w-full text-lg ${isEmpty(input.subTitle) ? "border-red-300" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-lg sm:text-base">Description <span className="text-red-500">*</span></Label>
              <RichTextEditor
                className={"text-lg"}
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

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-lg sm:text-base">Category <span className="text-red-500">*</span></Label>
                <Select onValueChange={selectCategory} value={input.category}>
                  <SelectTrigger className={`w-full ${isEmpty(input.category) ? "border-red-300" : ""}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>

                      {/* Web & Frontend */}
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                      <SelectItem value="React JS">React JS</SelectItem>
                      <SelectItem value="Next JS">Next JS</SelectItem>
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="CSS">CSS</SelectItem>
                      <SelectItem value="Tailwind CSS">Tailwind CSS</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>

                      {/* Backend & Full Stack */}
                      <SelectItem value="Backend Development">Backend Development</SelectItem>
                      <SelectItem value="Full Stack Development">Full Stack Development</SelectItem>
                      <SelectItem value="MERN Stack">MERN Stack</SelectItem>
                      <SelectItem value="Node JS">Node JS</SelectItem>
                      <SelectItem value="Spring Boot">Spring Boot</SelectItem>

                      {/* Databases */}
                      <SelectItem value="Database Management">Database Management</SelectItem>
                      <SelectItem value="MongoDB">MongoDB</SelectItem>
                      <SelectItem value="MySQL">MySQL</SelectItem>

                      {/* Programming Languages */}
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>

                      {/* AI & Data */}
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>

                      {/* Career */}
                      <SelectItem value="Data Structures & Algorithms">Data Structures & Algorithms</SelectItem>
                      <SelectItem value="Interview Preparation">Interview Preparation</SelectItem>

                    </SelectGroup>
                  </SelectContent>

                </Select>
              </div>

              {/* Course Level */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Course Level <span className="text-red-500">*</span></Label>
                <Select onValueChange={selectCourseLevel} value={input.courseLevel}>
                  <SelectTrigger className={`w-full ${isEmpty(input.courseLevel) ? "border-red-300" : ""}`}>
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

              {/* Price */}
              <div className="space-y-2">
                <Label className="text-lg sm:text-base">Price in (INR) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  name="coursePrice"
                  value={input.coursePrice}
                  onChange={changeEventHandler}
                  placeholder="199"
                  className={`w-full text-lg ${(!input.coursePrice || isNaN(Number(input.coursePrice)) || Number(input.coursePrice) <= 0) ? "border-red-300" : ""}`}
                />
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="space-y-2">
              <Label className="text-lg sm:text-base">Course Thumbnail <span className="text-red-500">*</span></Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                  <Input
                    type="file"
                    accept="image/*"
                    className={`w-full text-lg sm:w-fit ${!hasThumbnail ? "border-red-300" : ""}`}
                    onChange={selectThumbnail}
                  />
                </div>
                {previewThumbnail && (
                  <div className="relative">
                    <img
                      src={previewThumbnail}
                      alt="Course Thumbnail"
                      className="w-48 h-32 sm:w-64 sm:h-48 object-cover rounded-md border shadow-sm"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
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

            {/* Action Buttons - Mobile & Desktop */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t">
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={updateCourseHandler}
                  className="cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>

              {/* Mobile Save & Cancel Buttons */}
              <div className="lg:hidden w-full flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="cursor-pointer flex-1"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={updateCourseHandler}
                  className="cursor-pointer flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CourseTab;