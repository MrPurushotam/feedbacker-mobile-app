import { api } from '@/libs/api';
import { fetchMyForms } from '@/store/slice/formSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

const QUESTION_TYPES = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'URL', value: 'url' },
    { label: 'Date', value: 'date' },
    { label: 'MCQ', value: 'checkbox' } // <-- fix here
];

const emptyQuestion = () => ({
    question_text: '',
    question_type: 'text',
    options: [],
    is_required: false
});

interface EditFormProps {
    id: string;
}

const EditForm = ({ id }: EditFormProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [closed, setClosed] = useState(false);
    const [questions, setQuestions] = useState([emptyQuestion()]);
    const [submitting, setSubmitting] = useState(false);
    const [createdAt, setCreatedAt] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const resp = await api.get(`/feedback/detail/${id}`);
                if (resp.data.success) {
                    if (isMounted) {
                        setTitle(resp.data.form.title);
                        setDescription(resp.data.form.description);
                        // Fix: handle boolean or string for is_public and closed
                        setIsPublic(
                            resp.data.form.is_public === true ||
                            resp.data.form.is_public === "true"
                        );
                        setClosed(
                            resp.data.form.closed === true ||
                            resp.data.form.closed === "true"
                        );
                        setCreatedAt(resp.data.form.created_at);
                        const normalizedQuestions = (resp.data.form.questions || []).map((q: any) => ({
                            ...q,
                            options: Array.isArray(q.options)
                                ? q.options.map((opt: any, idx: number) =>
                                    typeof opt === 'string'
                                        ? { option_text: opt, order_index: idx }
                                        : { option_text: opt.option_text, order_index: opt.order_index ?? idx }
                                  )
                                : []
                        }));
                        setQuestions(normalizedQuestions.length ? normalizedQuestions : [emptyQuestion()]);
                        setError(null);
                    }
                } else {
                    setError(resp.data.message);
                }
            } catch (error: any) {
                setError(error.message)
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
        return () => { isMounted = false; };
    }, [id])

    const handleQuestionChange = (idx: number, key: string, value: any) => {
        setQuestions(qs => {
            const copy = [...qs];
            copy[idx] = { ...copy[idx], [key]: value };
            // Reset options if type changes away from checkbox
            if (key === 'question_type' && value !== 'checkbox') {
                copy[idx].options = [];
            }
            // If changing to checkbox and options is empty, initialize with two empty options
            if (key === 'question_type' && value === 'checkbox' && (!copy[idx].options || copy[idx].options.length < 2)) {
                copy[idx].options = [
                    { option_text: '', order_index: 0 },
                    { option_text: '', order_index: 1 }
                ];
            }
            return copy;
        });
    };

    const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
        setQuestions(qs => {
            const copy = [...qs];
            const opts = [...(copy[qIdx].options || [])];
            opts[optIdx] = { ...opts[optIdx], option_text: value };
            copy[qIdx].options = opts;
            return copy;
        });
    };

    const addOption = (qIdx: number) => {
        setQuestions(qs => {
            const copy = [...qs];
            const opts = [...(copy[qIdx].options || [])];
            opts.push({ option_text: '', order_index: opts.length });
            copy[qIdx].options = opts;
            return copy;
        });
    };

    const removeOption = (qIdx: number, optIdx: number) => {
        setQuestions(qs => {
            const copy = [...qs];
            let opts = [...(copy[qIdx].options || [])];
            opts.splice(optIdx, 1);
            // Reassign order_index after removal
            opts = opts.map((opt, idx) => ({ ...opt, order_index: idx }));
            copy[qIdx].options = opts;
            return copy;
        });
    };

    const moveOption = (qIdx: number, optIdx: number, dir: 'up' | 'down') => {
        setQuestions(qs => {
            const copy = [...qs];
            const opts = [...(copy[qIdx].options || [])];
            if (dir === 'up' && optIdx > 0) {
                [opts[optIdx - 1], opts[optIdx]] = [opts[optIdx], opts[optIdx - 1]];
            }
            if (dir === 'down' && optIdx < opts.length - 1) {
                [opts[optIdx + 1], opts[optIdx]] = [opts[optIdx], opts[optIdx + 1]];
            }
            // Reassign order_index after move
            copy[qIdx].options = opts.map((opt, idx) => ({ ...opt, order_index: idx }));
            return copy;
        });
    };

    const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);

    const deleteQuestion = (idx: number) => {
        setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);
    };

    // --- Submission Handler ---
    const handleSubmit = async () => {
        // Basic validation
        if (!title.trim()) return Alert.alert('Title is required');
        if (questions.some(q => !q.question_text.trim() || q.question_text.trim().length < 2)) return Alert.alert('All questions must have at least 2 characters');
        for (const q of questions) {
            if (q.question_type === 'mcq') {
                if (!q.options || q.options.length < 2 || q.options.some(opt => !opt.trim())) {
                    return Alert.alert('Each MCQ must have at least two non-empty options');
                }
            }
        }
        // Prepare payload according to CreateFormSchema
        const payload = {
            title: title.trim(),
            description: description.trim(),
            is_public: isPublic,
            closed,
            questions: questions.map((q, idx) => {
                let type = q.question_type;
                if (type === 'checkbox') type = 'checkbox';
                return {
                    question_text: q.question_text.trim(),
                    question_type: type,
                    is_required: q.is_required ?? true,
                    order_index: idx,
                    options: q.question_type === 'checkbox'
                        ? q.options.map((opt, oidx) => ({
                            option_text: opt.option_text,
                            order_index: oidx
                        }))
                        : undefined
                };
            })
        };
        setSubmitting(true);
        try {
            const resp = await api.patch(`/feedback/${id}`, payload);
            if (resp.data.success) {
                dispatch(fetchMyForms({}));
                Alert.alert('Form Updated', 'Your form has been updated.');
                router.back();
            } else {
                Alert.alert('Error Updating Form', resp.data.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || error?.message || 'Unknown error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', padding: 24 }}>
                <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Error</Text>
                <Text style={{ color: '#ef4444', fontSize: 16, textAlign: 'center', marginBottom: 24 }}>{error}</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        backgroundColor: '#2563eb',
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 32,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f9fafb' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
        >
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ marginTop: 80, padding: 16, paddingBottom: 180 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>Edit Form</Text>
                    {createdAt && (
                        <Text style={{ color: '#6b7280', marginBottom: 12, fontSize: 13 }}>
                            Created: {new Date(createdAt).toLocaleString()}
                        </Text>
                    )}
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Form title (emojis allowed)"
                        style={{
                            borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#fff'
                        }}
                    />

                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Form description (emojis allowed)"
                        multiline
                        numberOfLines={3}
                        style={{
                            borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#fff', minHeight: 60
                        }}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontWeight: 'bold', flex: 1 }}>Public</Text>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: '#rgba(55, 61, 83, 1)', true: '#rgba(45, 97, 241, 1)' }}
                            thumbColor={isPublic ? 'rgb(141 169 251)' : '#f4f3f4'}
                        />
                        <Text style={{ fontWeight: 'bold', marginLeft: 24, flex: 1 }}>Closed</Text>
                        <Switch
                            value={closed}
                            onValueChange={setClosed}
                            trackColor={{ false: '#rgba(55, 61, 83, 1)', true: '#ef4444' }}
                            thumbColor={closed ? '#FE9999' : '#f4f3f4'}
                        />
                    </View>

                    <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 8 }}>Questions</Text>
                    {questions.map((q, idx) => (
                        <View key={idx} style={{
                            backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 18,
                            borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Question {idx + 1}</Text>
                                {questions.length > 1 && (
                                    <TouchableOpacity onPress={() => deleteQuestion(idx)}>
                                        <Ionicons name="trash" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                value={q.question_text}
                                onChangeText={v => handleQuestionChange(idx, 'question_text', v)}
                                placeholder="Question text"
                                style={{
                                    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#f9fafb'
                                }}
                            />

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={{ marginRight: 10 }}>Type:</Text>
                                {QUESTION_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={{
                                            backgroundColor: q.question_type === type.value ? '#2563eb' : '#f3f4f6',
                                            borderRadius: 6,
                                            paddingVertical: 6,
                                            paddingHorizontal: 12,
                                            marginRight: 8
                                        }}
                                        onPress={() => handleQuestionChange(idx, 'question_type', type.value)}
                                    >
                                        <Text style={{ color: q.question_type === type.value ? '#fff' : '#111' }}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {q.question_type === 'checkbox' && (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Options</Text>
                                    {q.options.map((opt, optIdx) => (
                                        <View key={optIdx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                            <TextInput
                                                value={opt.option_text}
                                                onChangeText={v => handleOptionChange(idx, optIdx, v)}
                                                placeholder={`Option ${optIdx + 1}`}
                                                style={{
                                                    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 8, flex: 1, backgroundColor: '#f9fafb'
                                                }}
                                            />
                                            <TouchableOpacity onPress={() => moveOption(idx, optIdx, 'up')} disabled={optIdx === 0}>
                                                <Ionicons name="arrow-up" size={20} color={optIdx === 0 ? '#d1d5db' : '#2563eb'} style={{ marginLeft: 8 }} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => moveOption(idx, optIdx, 'down')} disabled={optIdx === q.options.length - 1}>
                                                <Ionicons name="arrow-down" size={20} color={optIdx === q.options.length - 1 ? '#d1d5db' : '#2563eb'} style={{ marginLeft: 4 }} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => removeOption(idx, optIdx)} disabled={q.options.length <= 2}>
                                                <Ionicons name="close" size={20} color={q.options.length <= 2 ? '#d1d5db' : '#ef4444'} style={{ marginLeft: 4 }} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TouchableOpacity onPress={() => addOption(idx)} style={{ marginTop: 4 }}>
                                        <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>+ Add Option</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Add more question settings here if needed */}
                        </View>
                    ))}
                </ScrollView>
                {/* Move both buttons to the fixed bottom bar */}
                <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f9fafb',
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb'
                }}>
                    <TouchableOpacity
                        onPress={addQuestion}
                        style={{
                            backgroundColor: '#2563eb',
                            borderRadius: 8,
                            paddingVertical: 12,
                            alignItems: 'center',
                            marginBottom: 12
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Question</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        style={{
                            backgroundColor: submitting ? '#4DC949' : '#0AA60FE7', // blue for edit
                            borderRadius: 8,
                            paddingVertical: 14,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}
                    >
                        {submitting && (
                            <ActivityIndicator size={20} color={"#fff"} style={{ marginRight: 8 }} />
                        )}
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>
                            {submitting ? 'Updating...' : 'Update Form'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default EditForm;