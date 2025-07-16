import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '@/libs/api';
import { AuthUserType } from '@/types/authTypes';
import { clearForms, fetchMyForms } from './formSlice';

interface InitialStateTypes {
    token: string | null;
    user: AuthUserType | null;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
}
const initialState: InitialStateTypes = {
    token: null,
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null,
}

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const resp = await api.get("/user/");
            if (resp.data.success) {
                return resp.data.user;
            } else {
                return rejectWithValue(resp.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await AsyncStorage.removeItem("token");
            dispatch(clearForms());
            return null;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateAuthState = createAsyncThunk(
    "auth/updateAuthState",
    async (payload: { token?: string, user?: AuthUserType }, { rejectWithValue, dispatch }) => {
        try {
            if (payload.token) {
                await AsyncStorage.setItem("token", payload.token);
            }
            const user = await dispatch(fetchUser()).unwrap();
            dispatch(fetchMyForms({ userId: user.id }));
            return payload;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const initializeAuth = createAsyncThunk(
    "auth/initializeAuth",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                const user = await dispatch(fetchUser()).unwrap();
                dispatch(fetchMyForms({ userId: user.id }));
                return { token, isLoggedIn: !!token }
            }
            else {
                return { token: null, isLoggedIn: false }
            }
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isLoggedIn = action.payload.isLoggedIn;
            })

            .addCase(initializeAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Auth initialization failed';
                state.isLoggedIn = false;
                state.token = null;
            })

            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })

            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(logout.fulfilled, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isLoggedIn = false;
                state.token = null;
            })

            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || "Logout Failed";
            })

            .addCase(updateAuthState.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateAuthState.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.token) {
                    state.token = action.payload.token;
                    state.isLoggedIn = true;
                }
                if (action.payload.user) {
                    state.user = action.payload.user;
                }
            })

            .addCase(updateAuthState.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Auth update failed";
            })

    }
})

export const { clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;