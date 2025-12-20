import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    user: null,
    token: null,
    isAuthenticated: false
};

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },

        userLoggedOut: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

    }

});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;