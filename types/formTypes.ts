
export interface formType {
    id: string;
    title: string;
    description: string;
    created_at: Date;
    response_count?: number;
    closed: boolean;
}

export interface optionsType {
    id: string;
    option_text: string;
    order_index: number;
}

export interface questionTypes {
    id: string;
    form_id: string;
    question_text: string;
    question_type: string;
    is_required: boolean;
    order_index: number;
    created_at: Date;
    updated_at: Date;
    options: optionsType[] | [];
}

export interface FormOpendTypes extends formType {
    response_count?: number;
    is_public: boolean;
    questions: questionTypes[];
}

export interface PublicFormView {
    id: string;
    title: string;
    description: string;
    is_public: boolean
    created_at: Date,
    questions: questionTypes[]
}

export interface answerTypes {
    question_id: string;
    answer_text?: string | null;
    option_id?: string | null;
    option_text?: string | null;
}

export interface responsesTypes {
    id: string;
    created_at: Date;
    answers: answerTypes[]
}

export interface paginationDetails {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    count: number;
}