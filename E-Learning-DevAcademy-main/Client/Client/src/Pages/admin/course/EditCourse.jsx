import { Button } from '@/components/ui/button'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CourseTab from './CourseTab';


const EditCourse = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId
  return (
    <div className='flex-1 mt-10'>
      <div className='flex items-center justify-between mb-5'>
        <h1 className='font-bold text-2xl'>Add detail information regarding course</h1>
        <Link>
          <Button variant={'link'} onClick={() => navigate("lecture")} className={'hover:text-blue-600 cursor-pointer cursor-pointer'}>Go to Lectures Page</Button>
        </Link>

      </div>
      <CourseTab />

    </div>
  )
}

export default EditCourse