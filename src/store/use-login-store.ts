import { create } from 'zustand';

interface LoginState {
    step: 'email' | 'otp';
    email: string;
    setStep: (step: 'email' | 'otp') => void;
    setEmail: (email: string) => void;
    reset: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
    step: 'email',
    email: '',
    setStep: (step) => set({ step }),
    setEmail: (email) => set({ email }),
    reset: () => set({ step: 'email', email: '' })
}));
