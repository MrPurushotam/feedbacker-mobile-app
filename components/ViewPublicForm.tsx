import { api } from '@/libs/api';
import { openFormPublicView } from '@/store/slice/formSlice';
import { answerTypes, questionTypes } from '@/types/formTypes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface ViewPublicFormProps {
    id: string;
}

type AnswersState = {
    [questionId: string]: {
        text?: string;
        singleOptionId?: string | null;
        checked?: boolean;
        selectedOptions?: string[];
    };
};

type SupportedType = 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'url';

const normalizeType = (t: string): SupportedType => {
    const s = (t || '').toLowerCase();
    if (s === 'text' || s === 'email' || s === 'number' || s === 'date' || s === 'checkbox' || s === 'radio' || s === 'url') {
        return s as SupportedType;
    }
    return 'text';
};

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidNumber = (v: string) => v.trim() !== '' && !isNaN(Number(v));
const isValidUrl = (v: string) => {
    try { new URL(v); return true; } catch { return false; }
};
const isValidDate = (v: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const d = new Date(v);
    return !isNaN(d.getTime());
};

export default function ViewPublicForm({ id }: ViewPublicFormProps) {
    const dispatch = useDispatch();
    const { publicForm, isLoadingPublicForm, error, formStatus, formNotFound } = useSelector((state: any) => state.form);
    const [answers, setAnswers] = useState<AnswersState>({});
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();


    const getInitialAnswers = useCallback((form: any): AnswersState => {
        const state: AnswersState = {};
        form?.questions?.forEach((q: questionTypes) => {
            const t = normalizeType(q.question_type);
            state[q.id] = {
                text: ['text', 'email', 'number', 'date', 'url'].includes(t) ? '' : undefined,
                singleOptionId: (t === 'radio' || (t === 'checkbox' && q.options?.length > 0)) ? null : undefined,
                checked: t === 'checkbox' && (!q.options || q.options.length === 0) ? false : undefined,
                // Remove selectedOptions, only singleOptionId is used for options
            };
        });
        return state;
    }, []);

    useEffect(() => {
        if (id) dispatch(openFormPublicView({ id }));
    }, [dispatch, id]);

    useEffect(() => {
        if (publicForm) setAnswers(getInitialAnswers(publicForm));
    }, [publicForm, getInitialAnswers]);


    const handleTextChange = (qid: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [qid]: { ...prev[qid], text: value } }));
    };

    const toggleRadio = (qid: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [qid]: { ...prev[qid], singleOptionId: optionId } }));
    };

    const toggleCheckbox = (qid: string, optionId?: string) => {
        setAnswers((prev) => {
            const question = publicForm?.questions.find(q => q.id === qid);

            // If checkbox has options, treat as single select (like radio)
            if (question?.options?.length && optionId) {
                return {
                    ...prev,
                    [qid]: { ...prev[qid], singleOptionId: prev[qid].singleOptionId === optionId ? null : optionId }
                };
            }

            // Simple checkbox (no options)
            return {
                ...prev,
                [qid]: { ...prev[qid], checked: !prev[qid].checked }
            };
        });
    };

    const validate = useCallback(() => {
        if (!publicForm) return { ok: false, message: 'Form not loaded' };

        for (const q of publicForm.questions) {
            if (!q.is_required) continue;
            const ans = answers[q.id];
            const t = normalizeType(q.question_type);

            if (['text', 'email', 'number', 'date', 'url'].includes(t)) {
                const val = ans?.text?.trim() || '';
                if (!val) return { ok: false, message: `Please answer: ${q.question_text}` };
                if (t === 'email' && !isValidEmail(val)) return { ok: false, message: `Enter a valid email for: ${q.question_text}` };
                if (t === 'number' && !isValidNumber(val)) return { ok: false, message: `Enter a valid number for: ${q.question_text}` };
                if (t === 'url' && !isValidUrl(val)) return { ok: false, message: `Enter a valid URL for: ${q.question_text}` };
                if (t === 'date' && !isValidDate(val)) return { ok: false, message: `Enter a valid date (YYYY-MM-DD) for: ${q.question_text}` };
            }

            if (t === 'radio' && !ans?.singleOptionId) {
                return { ok: false, message: `Please select an option for: ${q.question_text}` };
            }

            // Fix: For checkbox with options, check singleOptionId, not selectedOptions
            if (t === 'checkbox') {
                if (q.options?.length > 0 && !ans?.singleOptionId) {
                    return { ok: false, message: `Please select at least one option for: ${q.question_text}` };
                } else if (!q.options?.length && !ans?.checked) {
                    return { ok: false, message: `Please check: ${q.question_text}` };
                }
            }
        }
        return { ok: true };
    }, [answers, publicForm]);

    const buildPayload = useCallback(() => {
        const result: answerTypes[] = [];
        if (!publicForm) return { form_id: '', answers: result };

        for (const q of publicForm.questions) {
            const ans = answers[q.id];
            if (!ans) continue;

            const t = normalizeType(q.question_type);

            if (['text', 'email', 'number', 'date', 'url'].includes(t) && ans.text?.trim()) {
                result.push({ question_id: q.id, answer_text: ans.text.trim() });
            }

            // For both radio and checkbox with options, use singleOptionId
            if ((t === 'radio' || (t === 'checkbox' && q.options?.length > 0)) && ans.singleOptionId) {
                result.push({ question_id: q.id, option_id: ans.singleOptionId });
            }

            // Simple checkbox (no options)
            if (t === 'checkbox' && (!q.options?.length) && ans.checked !== undefined) {
                result.push({ question_id: q.id, answer_text: ans.checked ? 'true' : 'false' });
            }
        }
        return { form_id: publicForm.id, answers: result };
    }, [answers, publicForm]);


    const handleFormSubmit = async () => {
        const { ok, message } = validate();
        if (!ok) return Alert.alert('Incomplete', message || 'Please complete required fields.');
        setSubmitting(true);
        try {
            const { form_id, answers } = buildPayload();
            const resp = await api.post(`/response/${form_id}`, {answers});
            if (resp.data.success) {
                Alert.alert(
                    'Thank you!',
                    'Your response has been submitted.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back()
                        }
                    ]
                );
            }
        } catch (e:any) {
            Alert.alert('Submission failed', e?.response?.data?.message || e?.message || 'Please try again.');
        } finally {
            setSubmitting(false);
        }

    };

    const inputStyle = "border border-gray-300 rounded-lg px-3 py-2 text-base bg-white";
    const renderQuestion = (q: questionTypes) => {
        const opts = q.options
        const ans = answers[q.id];
        const t = normalizeType(q.question_type);

        return (
            <View
                key={q.id}
                className="bg-white rounded-xl p-4 mb-5 border border-gray-100"
                style={{
                    shadowColor: '#2563eb',
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 }
                }}
            >
                <Text className='font-medium text-base mb-3'>
                    {q.question_text}
                    {q.is_required && <Text className='text-red-600 text-lg font-semibold' > *</Text>}
                </Text>

                {t === 'text' && (
                    <TextInput
                        className={inputStyle}
                        placeholder="Your answer"
                        placeholderTextColor="#9ca3af"
                        value={ans?.text ?? ''}
                        onChangeText={(v) => handleTextChange(q.id, v)}
                    />
                )}

                {t === 'email' && (
                    <TextInput
                        className={inputStyle}

                        placeholder="you@example.com"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={ans?.text ?? ''}
                        onChangeText={(v) => handleTextChange(q.id, v)}
                    />
                )}

                {t === 'number' && (
                    <TextInput
                        className={inputStyle}

                        placeholder="123"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={ans?.text ?? ''}
                        onChangeText={(v) => handleTextChange(q.id, v.replace(/[^\d.-]/g, ''))}
                    />
                )}

                {t === 'date' && (
                    <TextInput
                        className={inputStyle}

                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9ca3af"
                        value={ans?.text ?? ''}
                        onChangeText={(v) => handleTextChange(q.id, v)}
                    />
                )}

                {t === 'url' && (
                    <TextInput
                        className={inputStyle}

                        placeholder="https://example.com"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="url"
                        value={ans?.text ?? ''}
                        onChangeText={(v) => handleTextChange(q.id, v)}
                    />
                )}

                {t === 'radio' && (
                    <View style={{ marginTop: 8 }}>
                        {opts.map((o) => {
                            const selected = ans?.singleOptionId === o.id;
                            return (
                                <TouchableOpacity
                                    key={o.id}
                                    className={`flex-row items-center p-3 rounded-lg border mb-2 ${selected ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                        }`}
                                    onPress={() => toggleRadio(q.id, o.id)}
                                >
                                    <Ionicons
                                        name={selected ? "radio-button-on" : "radio-button-off"}
                                        size={18}
                                        color={selected ? "#2563eb" : "#6b7280"}
                                    />
                                    <Text className="ml-3 text-gray-800">{o.option_text}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {t === 'checkbox' && opts.length > 0 ? (
                    <View style={{ marginTop: 8 }}>
                        {opts.map((o) => {
                            const selected = ans?.singleOptionId === o.id;
                            return (
                                <TouchableOpacity
                                    key={o.id}
                                    className={`flex-row items-center p-3 rounded-lg border mb-2 ${selected ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                        }`}
                                    onPress={() => toggleCheckbox(q.id, o.id)}
                                >
                                    <Ionicons
                                        name={selected ? "checkbox" : "square-outline"}
                                        size={18}
                                        color={selected ? "#2563eb" : "#6b7280"}
                                    />
                                    <Text className="ml-3 text-gray-800">{o.option_text}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    t === 'checkbox' && (
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
                            onPress={() => toggleCheckbox(q.id)}
                        >
                            <Ionicons
                                name={ans?.checked ? 'checkbox' : 'square-outline'}
                                size={22}
                                color={ans?.checked ? '#2563eb' : '#6b7280'}
                            />
                            <Text style={{ marginLeft: 10, fontSize: 15, color: '#1f2937' }}>
                                {q.question_text}
                            </Text>
                        </TouchableOpacity>
                    )
                )}
            </View>
        );
    };

    // Styled status/error/info box
    const StatusBox = ({ children, color = '#ef4444', bg = '#fef2f2', border = '#fecaca' }) => (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            width: '90%',
        }}>
            <View style={{
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 1,
                borderRadius: 10,
                padding: 18,
                minWidth: 250,
                maxWidth: 400,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text style={{ color, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                    {children}
                </Text>
            </View>
        </View>
    );

    if (isLoadingPublicForm) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-gray-500 mt-3">Loading form...</Text>
            </View>
        );
    }
    if (formStatus === "closed") {
        return (
            <StatusBox>
                Form is closed. Ask the administrator to open the form.
            </StatusBox>
        );
    }
    if (formNotFound) {
        return (
            <StatusBox>
                Form not found.
            </StatusBox>
        );
    }
    if (error) {
        return (
            <StatusBox>
                Error: {error}
            </StatusBox>
        );
    }
    if (!publicForm) {
        return (
            <StatusBox color="#6b7280" bg="#f3f4f6" border="#d1d5db">
                Form not found.
            </StatusBox>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: 80 }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                <View className="mb-8">
                    <Text className="text-2xl font-bold text-gray-900">{publicForm?.title}</Text>
                    {publicForm?.description && (
                        <Text className="text-gray-500 mt-1 text-base leading-relaxed">
                            {publicForm.description}
                        </Text>
                    )}
                </View>
                {publicForm?.questions?.map(renderQuestion)}

                <TouchableOpacity
                    disabled={submitting}
                    onPress={handleFormSubmit}
                    className={`mt-4 rounded-lg py-4 ${submitting ? "bg-blue-400" : "bg-blue-600"
                        }`}
                >
                    {submitting ? (
                        <View className="flex-row items-center justify-center">
                            <ActivityIndicator color="#fff" />
                            <Text className="text-white font-semibold ml-2">Submitting...</Text>
                        </View>
                    ) : (
                        <Text className="text-white text-center font-semibold text-lg">
                            Submit
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}