import { createSlice } from "@reduxjs/toolkit";


const initialState={
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token")
}
const authSlice=createSlice({
    name:"authSlice",
    initialState,
    reducers:{
        userLoggedIn:(state,action)=>{
            state.user=action.payload.user;
            state.token=action.payload.token;
            state.isAuthenticated=true;
        },
        userLoggedOut:(state)=>{
           state.user=null;
           state.token=null;
           state.isAuthenticated=false; 
           
        }
    }

});

export const {userLoggedIn,userLoggedOut}=authSlice.actions;
export default authSlice.reducer;