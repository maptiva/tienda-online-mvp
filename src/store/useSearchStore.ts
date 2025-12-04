import { create } from "zustand";

interface SearchState {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    clearSearch: () => void;
}

export const useSearchState = create<SearchState>((set) => ({
    searchTerm: "",
    setSearchTerm: (term) => set({ searchTerm: term }),
    clearSearch: () => set({ searchTerm: "" }),
}));
