import {configureStore} from "@reduxjs/toolkit";
import rootReducer from "./rootReducer.js";
import { authApi } from "@/features/api/authApi.js";
import { courseApi } from "@/features/api/courseApi.js";
import { courseProgressApi } from "@/features/api/courseProgressApi.js";

export const appStore=configureStore({
    reducer:rootReducer,
    middleware:(defaultMiddleware)=>defaultMiddleware().concat(authApi.middleware,courseApi.middleware,courseProgressApi.middleware)
});

const initializedApp=async()=>{
   await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}));
}

initializedApp();