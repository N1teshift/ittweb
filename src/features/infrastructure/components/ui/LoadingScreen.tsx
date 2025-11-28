import React from "react";

interface LoadingScreenProps {
    message?: string;
}

/**
 * A full-screen loading component that displays a loading indicator and message.
 * Useful for initial page loads or major transitions.
 *
 * @param props The component props.
 * @param props.message Optional. The message displayed below the loader. Defaults to "Loading...".
 * @returns A React element representing the loading screen.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = "Loading...",
}) => {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
                <div className="loader" aria-label="Loading"></div>
                <p className="mt-4 text-lg font-semibold text-amber-400 font-medieval">{message}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;

