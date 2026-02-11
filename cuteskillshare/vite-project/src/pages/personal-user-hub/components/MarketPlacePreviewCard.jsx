import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const MarketplacePreviewCard = ({ offering, onBookClick, onViewProfile }) => {
  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-warm hover-lift transition-smooth">
      <div className="relative h-40 md:h-48 overflow-hidden bg-muted">
        <Image
          src={offering?.coverImage}
          alt={offering?.coverImageAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full">
          <div className="flex items-center gap-1">
            <Icon name="Star" size={14} color="var(--color-warning-foreground)" />
            <span className="text-xs md:text-sm font-semibold text-foreground data-text">
              {offering?.rating}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={offering?.instructorAvatar}
              alt={offering?.instructorAvatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-1 truncate">
              {offering?.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground caption truncate">
              by {offering?.instructorName}
            </p>
          </div>
        </div>

        <p className="text-sm md:text-base text-foreground leading-relaxed mb-4 line-clamp-2">
          {offering?.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-muted rounded-full">
            <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
            <span className="text-xs md:text-sm text-foreground data-text">{offering?.duration}</span>
          </div>
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-muted rounded-full">
            <Icon name="Users" size={14} color="var(--color-muted-foreground)" />
            <span className="text-xs md:text-sm text-foreground data-text">{offering?.students} students</span>
          </div>
          <div className="flex items-center gap-1 px-2 md:px-3 py-1 bg-secondary rounded-full">
            <Icon name="Award" size={14} color="var(--color-secondary-foreground)" />
            <span className="text-xs md:text-sm font-medium text-secondary-foreground">
              {offering?.level}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground caption mb-1">Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-heading font-bold text-foreground data-text">
                {offering?.price}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">SkillCoins</span>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => onBookClick(offering)}
            iconName="Calendar"
            iconPosition="left"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePreviewCard;