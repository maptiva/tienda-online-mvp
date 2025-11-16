import { useEffect, useState, type ChangeEvent } from 'react';

type InputChage = {
    target: {
        name: string,
        value: string | number
    }
}


export function useForm<T extends object>(initialForm: T) {

    const [formState, setFormState] = useState(initialForm);

    useEffect(() => {
        setFormState(initialForm);
    }, [initialForm])


    const onInputChange = ({ target }: InputChage) => {
        const { name, value } = target;
        setFormState((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const onResetForm = () => {
        setFormState(initialForm);
    }


    return {
        ...formState,
        formState,
        onInputChange,
        onResetForm,
    }
}