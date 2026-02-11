import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const OngoingExchangeCard = ({ exchange, onScheduleClick, onViewDetails }) => {
  const progressPercentage = (exchange?.completedSessions / exchange?.totalSessions) * 100;

  return (
    <div className="bg-card rounded-3xl p-4 md:p-6 shadow-warm hover-lift transition-smooth">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-muted">
            <Image
              src={exchange?.partnerAvatar}
              alt={exchange?.partnerAvatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-success rounded-full border-2 border-card flex items-center justify-center">
            <Icon name="Check" size={14} color="var(--color-success-foreground)" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-1 truncate">
            {exchange?.partnerName}
          </h3>
          <p className="text-sm text-muted-foreground caption truncate">{exchange?.partnerTitle}</p>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="BookOpen" size={18} color="var(--color-secondary-foreground)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground caption">You're Teaching</p>
            <p className="font-medium text-sm md:text-base text-foreground truncate">{exchange?.teachingSkill}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
            <Icon name="GraduationCap" size={18} color="var(--color-accent-foreground)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground caption">You're Learning</p>
            <p className="font-medium text-sm md:text-base text-foreground truncate">{exchange?.learningSkill}</p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-foreground">Progress</span>
          <span className="text-xs md:text-sm font-medium text-foreground data-text">
            {exchange?.completedSessions}/{exchange?.totalSessions} sessions
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-smooth"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 bg-muted rounded-2xl mb-4">
        <Icon name="Calendar" size={16} color="var(--color-muted-foreground)" />
        <span className="text-xs md:text-sm text-foreground">
          Next Session: {exchange?.nextSession}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(exchange)}
          className="flex-1"
          iconName="Eye"
          iconPosition="left"
        >
          View Details
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onScheduleClick(exchange)}
          className="flex-1"
          iconName="Clock"
          iconPosition="left"
        >
          Reschedule
        </Button>
      </div>
    </div>
  );
};

export default OngoingExchangeCard;