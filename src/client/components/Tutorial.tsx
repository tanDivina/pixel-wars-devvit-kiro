import { useState, useEffect } from 'react';
import type { Team } from '../../shared/types/game';

interface TutorialProps {
  team: Team | null;
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '🎮 Welcome to Pixel Wars!',
    content:
      'A massively multiplayer territory control game where teams compete to dominate the canvas.',
    tip: 'You\'ll be working with your team to claim as much territory as possible!',
  },
  {
    title: '🎨 How to Place Pixels',
    content:
      "Simply tap or click anywhere on the canvas to place a pixel in your team's color. Each pixel you place helps your team control more territory!",
    tip: 'Look for the hover preview - it shows where your pixel will be placed.',
  },
  {
    title: '⚡ Pixel Credits System',
    content:
      'You start with 5 credits. Each pixel costs 1 credit. Credits automatically regenerate every 2 minutes (maximum 10 credits).',
    tip: 'The timer at the top shows when your next credit will arrive. Plan your moves strategically!',
  },
  {
    title: '🗺️ Territory Control',
    content:
      'The canvas is divided into zones (10×10 pixel squares). Your team controls a zone when you have more pixels in it than any other team.',
    tip: 'Zones with colored borders show which team controls them. Focus on defending your zones and capturing new ones!',
  },
  {
    title: '⏱️ Competitive Seasons',
    content:
      'Pixel Wars runs in 7-day seasons! The team with the highest score wins. Score = (Zones Controlled × 100) + Total Pixels.',
    tip: 'Watch the countdown timer in the header to see when the season ends. Every pixel counts!',
  },
  {
    title: '🏆 Leaderboard & Stats',
    content:
      'Click the Leaderboard button to see top players and team standings. Track your personal rank and your team\'s progress!',
    tip: 'The leaderboard updates in real-time. Compete with others and coordinate with your team!',
  },
  {
    title: '🎯 Navigation Controls',
    content:
      'Desktop: Click to place • Drag to pan • Scroll to zoom\nMobile: Tap to place • Drag to pan • Pinch to zoom',
    tip: 'Use the +/- buttons or Reset button in the control panel for quick navigation.',
  },
];

export const Tutorial = ({ team, onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('pixelwars_tutorial_seen');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('pixelwars_tutorial_seen', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  if (!step) return null; // Safety check
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
        {/* Team Badge (shown on first step) */}
        {isFirstStep && team && (
          <div className="flex items-center justify-center gap-3 mb-4 p-4 bg-gray-100 rounded-lg">
            <div
              className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <div className="text-sm text-gray-600">You're on</div>
              <div className="text-xl font-bold" style={{ color: team.color }}>
                {team.name}
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">{step.content}</p>
          {step.tip && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-left rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip: </span>
                {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                    ? 'bg-blue-400'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons - Optimized touch targets */}
        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              className="flex-1 px-4 py-4 min-h-[48px] bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation"
              aria-label="Go to previous tutorial step"
            >
              ← Back
            </button>
          )}

          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-4 min-h-[48px] bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation"
            aria-label="Skip tutorial"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="flex-1 px-4 py-4 min-h-[48px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium touch-manipulation"
            aria-label={isLastStep ? "Start playing" : "Go to next tutorial step"}
          >
            {isLastStep ? "Let's Play! 🚀" : 'Next →'}
          </button>
        </div>

        {/* Step Counter */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>
      </div>
    </div>
  );
};
