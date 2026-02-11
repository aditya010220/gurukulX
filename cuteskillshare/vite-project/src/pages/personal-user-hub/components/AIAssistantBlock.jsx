import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIAssistantBlock = ({ tips, onAskQuestion }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips?.length);
  };

  const handlePrevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips?.length) % tips?.length);
  };

  const currentTip = tips?.[currentTipIndex];

  return (
    <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-6 md:p-8 shadow-warm">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
          <Icon name="Sparkles" size={28} color="var(--color-primary-foreground)" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
            AI Learning Assistant
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Personalized guidance for your skill journey
          </p>
        </div>
      </div>
      <div className="bg-card rounded-2xl p-4 md:p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={18} color="var(--color-secondary-foreground)" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-2">
              {currentTip?.title}
            </h3>
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              {currentTip?.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevTip}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-smooth press-scale focus-ring-lavender"
              aria-label="Previous tip"
            >
              <Icon name="ChevronLeft" size={20} color="var(--color-foreground)" />
            </button>
            <button
              onClick={handleNextTip}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-smooth press-scale focus-ring-lavender"
              aria-label="Next tip"
            >
              <Icon name="ChevronRight" size={20} color="var(--color-foreground)" />
            </button>
          </div>

          <span className="text-xs md:text-sm text-muted-foreground caption data-text">
            {currentTipIndex + 1} / {tips?.length}
          </span>
        </div>
      </div>
      <Button
        variant="default"
        size="default"
        onClick={onAskQuestion}
        fullWidth
        iconName="MessageCircle"
        iconPosition="left"
      >
        Ask AI Assistant
      </Button>
    </div>
  );
};

export default AIAssistantBlock;