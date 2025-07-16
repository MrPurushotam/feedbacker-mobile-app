import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import formSlice from "./slice/formSlice";

export const ReduxStore = configureStore({
    reducer:{
        auth: authSlice,
        form:formSlice
    }   
});