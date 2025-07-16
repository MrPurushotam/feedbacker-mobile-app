import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '@/libs/api';
import { FormOpendTypes, formType, responseTypes } from '@/types/formTypes';
import { useSelector } from 'react-redux';
import { logout } from './authSlice';

interface InitalStateTypes {
    isLoading: boolean;
    forms: formType[];
    formOpend: FormOpendTypes | null;
    responseDetails: responseTypes | [];
    error: string | null;
}

const initialState: InitalStateTypes = {
    isLoading: false,
    error: null,
    forms: [],
    formOpend: null,
    responseDetails: [],
}

export const fetchMyForms = createAsyncThunk(
    "form/fetchMyForms",
    async ({ userId = "" }: { userId?: string }, { rejectWithValue, getState }) => {
        try {
            if (!userId.trim()) {
                const state = getState();
                // @ts-ignore
                const { user } = state.auth;
                userId = user.id;
            }
            const resp = await api.get("/feedback/all", { params: { id: userId } });
            if (resp.data.success) {
                return resp.data.forms;
            } else {
                return rejectWithValue(resp.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

export const openFormWithResponses = createAsyncThunk(
    "form/openFormWithResponses",
    async (payload: { id: string }, { rejectWithValue }) => {
        try {
            const [formResponse, responseResponse] = await Promise.all([
                api.get(`/feedback/details/${payload.id}`),
                api.get(`/response/all/${payload.id}`)
            ]);

            if (!formResponse.data.success) {
                return rejectWithValue(formResponse.data.message);
            }

            if (!responseResponse.data.success) {
                return rejectWithValue(responseResponse.data.message);
            }

            return {
                form: formResponse.data.form,
                responses: responseResponse.data.response,
                pagination: responseResponse.data.pagination
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteForm = createAsyncThunk(
    "form/deleteForm",
    async (payload: { id: string }, { rejectWithValue }) => {
        try {
            const resp = await api.delete(`/form/${payload.id}`);
            if (resp.data.success) {
                return payload.id;
            }
            else {
                return rejectWithValue(resp.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const formSlice = createSlice({
    name: "form",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearForms: (state) => {
            state.error = null;
            state.forms = [];
            state.formOpend = null;
            state.responseDetails = [];
        }
    },
    extraReducers: ((builder) => {
        builder
            .addCase(fetchMyForms.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(fetchMyForms.fulfilled, (state, actions) => {
                state.forms = actions.payload;
                state.isLoading = false;
                state.error = null;
            })

            .addCase(fetchMyForms.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            })

            .addCase(openFormWithResponses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(openFormWithResponses.fulfilled, (state, action) => {
                state.formOpend = action.payload.form;
                state.responseDetails = action.payload.responses;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(openFormWithResponses.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            })

            .addCase(deleteForm.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(deleteForm.fulfilled, (state, action) => {
                state.forms = state.forms.filter(form => form.id !== action.payload);
                if (state.formOpend && state.formOpend.id === action.payload) {
                    state.formOpend = null;
                    state.responseDetails = [];
                }
                state.isLoading = false;
                state.error = null;
            })

            .addCase(deleteForm.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            })

            .addCase(logout.fulfilled, (state) => {
                state.forms = [];
                state.formOpend = null;
                state.responseDetails = [];
                state.error = null;
                state.isLoading = false;
            })
    })
})

export const { clearError, clearForms } = formSlice.actions;
export default formSlice.reducer;