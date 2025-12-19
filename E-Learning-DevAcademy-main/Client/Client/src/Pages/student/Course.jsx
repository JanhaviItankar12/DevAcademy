import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import React from 'react'
import { Link } from 'react-router-dom'


const Course = ({ course }) => {
    const courseId = course?._id;

    return (
        <Link to={`/course-detail/${courseId}`} className="block w-full">
            <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 p-0 h-full flex flex-col">
                {/* Fixed height image container */}
                <div className="relative w-full h-48 bg-white flex items-center justify-center overflow-hidden">
                    <img
                        src={course?.courseThumbnail || "https://github.com/shadcn.png"}
                        alt={course?.courseTitle || "Course thumbnail"}
                        className="max-w-full max-h-full object-contain p-2"
                        onError={(e) => {
                            e.currentTarget.src = "https://github.com/shadcn.png";
                        }}
                    />
                </div>

                {/* Content section */}
                <CardContent className="px-5 py-4 space-y-3 flex-grow flex flex-col">
                    {/* Title with 2-line truncation */}
                    <h1 className="hover:underline font-bold text-lg line-clamp-2 leading-tight">
                        {course?.courseTitle}
                    </h1>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage
                                    src={course?.creator?.photoUrl || 'https://github.com/shadcn.png'}
                                    alt={course?.creator?.name || 'Creator-Name'}
                                />
                                <AvatarFallback>
                                    {course?.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            {/* Creator name with single-line truncation */}
                            <h1 className="font-medium text-sm truncate">
                                {course?.creator?.name}
                            </h1>
                        </div>
                        <Badge className="bg-blue-600 text-white px-2 py-1 text-xs rounded-full flex-shrink-0">
                            {course?.courseLevel}
                        </Badge>
                    </div>

                    {/* Price section - pushed to bottom */}
                    <div className="mt-auto pt-2">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{course?.coursePrice}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default Course;