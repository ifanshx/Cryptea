// hooks/usePopup.tsx
import { useState } from 'react';

const usePopup = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);

    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);
    const togglePopup = () => setIsOpen(!isOpen);

    return {
        isOpen,
        openPopup,
        closePopup,
        togglePopup
    };
};

export default usePopup;