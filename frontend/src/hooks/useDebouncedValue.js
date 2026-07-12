import { useEffect, useState } from 'react'

export function useDebouncedValue(value, delayMs) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeOut(() => setDebounced(value), delayMs)
        return () => clearTimeout(timer)
    }, [value, delayMs])

    return debounced
}