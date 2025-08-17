import { api } from '@/libs/api';
import { FormOpendTypes, formType, PublicFormView, responsesTypes } from '@/types/formTypes';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice';

interface InitalStateTypes {
    isLoading: boolean;
    isLoadingPublicForm: boolean;
    genericLoading: boolean;
    forms: formType[];
    formOpend: FormOpendTypes | null;
    publicForm: PublicFormView | null;
    responseDetails: responsesTypes | [];
    error: string | null;
    genericError: string | null;
    formStatus: string | null;
    formNotFound: boolean;
}

const initialState: InitalStateTypes = {
    isLoading: false,
    genericLoading: false,
    genericError: null,
    error: null,
    forms: [],
    formOpend: null,
    publicForm: null,
    isLoadingPublicForm: false,
    responseDetails: [],
    formStatus: null,
    formNotFound: false,
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
            const id = userId?.trim();
            const resp = await api.get("/feedback/all", { params: { id } });
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
                api.get(`/feedback/detail/${payload.id}`),
                api.get(`/response/all/${payload.id}`)
            ]);
            if (!formResponse.data.success) {
                return rejectWithValue(formResponse.data.message);
            }

            if (!responseResponse.data.success) {
                return rejectWithValue(responseResponse.data.message);
            }
            const data = {
                form: formResponse.data.form,
                responses: responseResponse.data.responses,
                pagination: responseResponse.data.pagination
            }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
)

export const openFormPublicView = createAsyncThunk(
    "form/openFormPublicView",
    async (payload: { id: string }, { rejectWithValue }) => {
        const publicFormData = await api.get(`/feedback/${payload.id}`)
        if (!publicFormData.data.success) {
            return rejectWithValue(publicFormData.data.message);
        } else {
            if (!publicFormData.data.form) {
                return rejectWithValue(publicFormData.data.message);
            }
            return publicFormData.data.form;
        }
    }
)

export const deleteForm = createAsyncThunk(
    "form/deleteForm",
    async (payload: { id: string }, { rejectWithValue }) => {
        try {
            const resp = await api.delete(`/feedback/${payload.id}`);
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
            state.formStatus = null;
            state.formNotFound = false;
            state.genericError = null;
            state.genericLoading = false;
        },
        clearForms: (state) => {
            state.error = null;
            state.forms = [];
            state.formOpend = null;
            state.responseDetails = [];
            state.formStatus = null;
            state.formNotFound = false;
            state.genericError = null;
            state.genericLoading = false;
        },
        clearPublicForm: (state) => {
            state.formOpend = null;
            state.formNotFound = false;
            state.formStatus = null;
            state.genericError = null;
            state.genericLoading = false;
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
                state.responseDetails = action.payload.responses || [];
                state.isLoading = false;
                state.error = null;
            })
            .addCase(openFormWithResponses.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            })
            .addCase(openFormPublicView.pending, (state) => {
                state.isLoadingPublicForm = true;
                state.error = null;
                state.formStatus = null;
                state.formNotFound = false;
            })
            .addCase(openFormPublicView.fulfilled, (state, action) => {
                state.publicForm = action.payload;
                state.isLoadingPublicForm = false;
                state.error = null;
                state.formStatus = action.payload?.status || null;
                state.formNotFound = false;
            })
            .addCase(openFormPublicView.rejected, (state, action) => {
                const msg = action.payload as string;
                state.error = msg;
                state.isLoadingPublicForm = false;
                if (msg === "Form is closed") {
                    state.formStatus = "closed";
                } else {
                    state.formStatus = null;
                }
                state.formNotFound = msg === "Form not found";
            })
            .addCase(deleteForm.pending, (state) => {
                state.genericLoading = true;
                state.genericError = null;
            })
            .addCase(deleteForm.fulfilled, (state, action) => {
                state.forms = state.forms.filter(form => form.id !== action.payload);
                if (state.formOpend && state.formOpend.id === action.payload) {
                    state.formOpend = null;
                    state.responseDetails = [];
                }
                state.genericLoading = false;
                state.genericError = null;
            })
            .addCase(deleteForm.rejected, (state, action) => {
                state.genericError = action.payload as string;
                state.genericLoading = false;
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

export const { clearError, clearForms, clearPublicForm } = formSlice.actions;
export default formSlice.reducer;