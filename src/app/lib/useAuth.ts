// Re-export from the shared AuthProvider context.
// Components that import from this path will use the single session
// listener established at the app root rather than creating their own.
export { useAuth } from '../../contexts/AuthProvider';
