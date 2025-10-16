import React from 'react'
interface Props {
    message: string
}

export const Loading = ({ message }: Props) => {
    return (
        <div className="flex flex-col items-center w-full h-full justify-center py-8">
            <span className="mb-2">
                <span className="block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            </span>
            <span className="text-xl font-medium text-gray-700">
                Cargando {typeof message === 'string' ? message : '...'}
            </span>
        </div>
    )
}
