import React, { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '@/store/slice/authSlice';

interface InitalizeProps {
    children: ReactNode;
}


const Initalize = ({ children }: InitalizeProps) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // @ts-ignore
        dispatch(initializeAuth());
    }, [dispatch]);

    return (
        <>
            {children}
        </>
    );
};

export default Initalize;
