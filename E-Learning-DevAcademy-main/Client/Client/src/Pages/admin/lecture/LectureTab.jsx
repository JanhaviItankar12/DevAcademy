import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation, } from '@/features/api/courseApi'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const media_api = `${import.meta.env.VITE_BACKEND_URL}/api/v1/media`;

const LectureTab = () => {
    const params = useParams();
    const { courseId, lectureId } = params;
    const navigate = useNavigate();

    const [lectureTitle, setLectureTitle] = useState("");
    const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
    const [isFree, setIsFree] = useState(false);
    const [mediaProgress, setMediaProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [btnDisable, setBtnDisable] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
    const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();
    const { data: lectureData, isLoading: lectureLoading, isSuccess: lectureSuccess, isError: lectureError, refetch } = useGetLectureByIdQuery(lectureId);
    const lecture = lectureData?.lecture;

   
    useEffect(() => {
        if (lecture) {
            refetch();
            setLectureTitle(lecture.lectureTitle);
            setIsFree(lecture.isPreviewFree);
            setUploadVideoInfo(lecture.videoUrl);
            setBtnDisable(false); // Enable button if lecture data exists
        }
    }, [lecture]);

    // Track changes to enable/disable update button
    useEffect(() => {
        if (lecture) {
            const titleChanged = lectureTitle !== lecture.lectureTitle;
            const freeChanged = isFree !== lecture.isPreviewFree;
            // Handle both object and direct URL formats
            const currentVideoUrl = typeof uploadVideoInfo === 'string' ? uploadVideoInfo : uploadVideoInfo?.videoUrl;
            const lectureVideoUrl = typeof lecture.videoUrl === 'string' ? lecture.videoUrl : lecture.videoUrl?.videoUrl;
            const videoChanged = currentVideoUrl !== lectureVideoUrl;
            setHasChanges(titleChanged || freeChanged || videoChanged);
        }
    }, [lectureTitle, isFree, uploadVideoInfo, lecture]);

    //upload video
    const fileChangehandler = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            setMediaProgress(true);
            setUploadProgress(0);
            setBtnDisable(true); // Disable button during upload

            try {
                const res = await axios.post(`${media_api}/upload-video`, formData, {
                    onUploadProgress: ({ loaded, total }) => {
                        // Cap at 95% to show processing state
                        const progress = Math.round((loaded * 100) / total);
                        setUploadProgress(Math.min(progress, 95));
                    }
                });

                if (res.data.success) {
                    // Show 100% only after server confirms success
                    setUploadProgress(100);
                    setUploadVideoInfo({ videoUrl: res.data.data.url, publicId: res.data.data.public_id });
                    setBtnDisable(false);
                    toast.success(res.data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error('Video upload failed');
                setBtnDisable(false);
            } finally {
                setMediaProgress(false);
            }
        }
    }

    const editLectureHandler = async () => {
        await editLecture({ lectureTitle, videoInfo: uploadVideoInfo, isPreviewFree: isFree, courseId, lectureId })
    }

    const removeLectureHandler = async () => {
        try {
            const res = await removeLecture(lectureId).unwrap();
            toast.success(res.message || "Lecture removed successfully");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to remove lecture");
        }
    };


    //for remove lecture
    useEffect(() => {
        if (removeSuccess) {
            toast.success(removeData.message || "Lecture Deleted Successfully");
            navigate(`/instructor/course/${courseId}/lecture`);
        }
    }, [removeSuccess])

    //for update lecture
    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "Edit successfully");
        }
        if (error) {
            toast.error(error.data.message);
        }
    }, [isSuccess, error]);

    return (
        <Card>
            <CardHeader className={'flex justify-between'}>
                <div>
                    <CardTitle>Edit Lecture</CardTitle>
                    <CardDescription>Make changes and click save when done.</CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        variant={'destructive'}
                        className={'cursor-pointer'}
                        disabled={removeLoading}
                        onClick={removeLectureHandler}
                    >
                        {removeLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </>
                        ) : "Remove Lecture"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-2'>
                    <Label>Title</Label>
                    <Input
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        type={'text'}
                        placeholder="Ex. Introduction to Java"
                    />
                </div>

                <div className='my-5 space-y-2'>
                    <Label>Video <span className='text-red-500'>*</span></Label>
                    <Input
                        type={'file'}
                        accept='video/*'
                        onChange={fileChangehandler}
                        className={'w-fit'}
                        disabled={mediaProgress}
                    />
                </div>

                {/* Video Preview Section */}
                {uploadVideoInfo && !mediaProgress && (
                    <div className='my-5 space-y-2'>
                        <Label>Current Video Preview</Label>
                        <div className='border rounded-lg overflow-hidden bg-black'>
                            <video
                                controls
                                className='w-full aspect-video object-contain'
                                src={typeof uploadVideoInfo === 'string' ? uploadVideoInfo : uploadVideoInfo.videoUrl}
                                style={{ maxHeight: '400px' }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                )}

                {/* Upload Progress */}
                {mediaProgress && (
                    <div className='my-5 space-y-2'>
                        <Label>Uploading Video...</Label>
                        <Progress value={uploadProgress} className='h-2' />
                        <p className='text-sm text-muted-foreground'>
                            {uploadProgress < 95
                                ? `${uploadProgress}% uploaded - Please wait while your video is being uploaded`
                                : uploadProgress === 100
                                    ? 'Upload complete!'
                                    : 'Processing video on server...'
                            }
                        </p>
                    </div>
                )}

                <div className='flex items-center space-x-2 my-5'>
                    <Switch
                        checked={isFree}
                        onCheckedChange={setIsFree}
                        id="airplane-mode"
                        disabled={mediaProgress}
                    />
                    <Label htmlFor="airplane-mode">Is this video FREE?</Label>
                </div>

                <div className='mt-4'>
                    <Button
                        onClick={editLectureHandler}
                        disabled={isLoading || mediaProgress || !hasChanges}
                        className={'cursor-pointer'}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </>
                        ) : mediaProgress ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Uploading...
                            </>
                        ) : "Save Lecture"}
                    </Button>
                    {!hasChanges && !mediaProgress && (
                        <p className='text-sm text-muted-foreground mt-2'>
                            No changes to save
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default LectureTab