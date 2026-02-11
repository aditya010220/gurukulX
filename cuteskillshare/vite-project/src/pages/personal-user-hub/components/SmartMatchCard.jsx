import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SmartMatchCard = ({ match, onConnectClick }) => {
  return (
    <div className="bg-card rounded-3xl p-4 md:p-6 shadow-warm hover-lift transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={match?.avatar}
              alt={match?.avatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-1 truncate">
              {match?.name}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground caption truncate">{match?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-success rounded-full flex-shrink-0">
          <Icon name="Sparkles" size={14} color="var(--color-success-foreground)" />
          <span className="text-xs md:text-sm font-semibold text-success-foreground data-text">
            {match?.compatibilityScore}%
          </span>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs md:text-sm text-muted-foreground caption mb-2">Can Teach You</p>
          <div className="flex flex-wrap gap-2">
            {match?.canTeach?.slice(0, 3)?.map((skill, index) => (
              <span
                key={index}
                className="px-2 md:px-3 py-1 bg-secondary rounded-full text-xs md:text-sm font-medium text-secondary-foreground"
              >
                {skill}
              </span>
            ))}
            {match?.canTeach?.length > 3 && (
              <span className="px-2 md:px-3 py-1 bg-muted rounded-full text-xs md:text-sm font-medium text-muted-foreground">
                +{match?.canTeach?.length - 3}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs md:text-sm text-muted-foreground caption mb-2">Wants to Learn</p>
          <div className="flex flex-wrap gap-2">
            {match?.wantsToLearn?.slice(0, 3)?.map((skill, index) => (
              <span
                key={index}
                className="px-2 md:px-3 py-1 bg-accent rounded-full text-xs md:text-sm font-medium text-accent-foreground"
              >
                {skill}
              </span>
            ))}
            {match?.wantsToLearn?.length > 3 && (
              <span className="px-2 md:px-3 py-1 bg-muted rounded-full text-xs md:text-sm font-medium text-muted-foreground">
                +{match?.wantsToLearn?.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icon name="MapPin" size={14} color="var(--color-muted-foreground)" />
          <span className="truncate">{match?.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Star" size={14} color="var(--color-warning-foreground)" />
          <span className="data-text">{match?.rating}</span>
        </div>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={() => onConnectClick(match)}
        fullWidth
        iconName="UserPlus"
        iconPosition="left"
      >
        Connect & Exchange
      </Button>
    </div>
  );
};

export default SmartMatchCard;