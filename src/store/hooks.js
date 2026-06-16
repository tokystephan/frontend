// src/store/hooks.js

import { useDispatch, useSelector } from 'react-redux'

// Hook pour dispatcher les actions Redux
export const useAppDispatch = () => useDispatch()

// Hook pour sélectionner l'état Redux
export const useAppSelector = useSelector