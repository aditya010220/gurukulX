import React from 'react';
import Icon from '../../../components/AppIcon';

const HeroWelcomeCard = ({ userName, skillCoins, currentStreak, totalExchanges }) => {
  const currentHour = new Date()?.getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl p-6 md:p-8 lg:p-10 shadow-warm-lg">
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <p className="text-sm md:text-base text-primary-foreground/80 caption mb-2">
              {greeting}, {userName}! 🌱
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-primary-foreground mb-4">
              Your Learning Garden is Growing
            </h1>
            <p className="text-sm md:text-base text-primary-foreground/90 max-w-2xl">
              You've completed {totalExchanges} skill exchanges and earned {skillCoins} SkillCoins. Keep nurturing your skills!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-4 lg:gap-6">
            <div className="flex-1 sm:flex-none bg-card/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 min-w-[140px] hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon name="Coins" size={24} color="var(--color-secondary-foreground)" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-heading font-bold text-foreground data-text">
                {skillCoins}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground caption mt-1">SkillCoins</p>
            </div>

            <div className="flex-1 sm:flex-none bg-card/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 min-w-[140px] hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success flex items-center justify-center">
                  <Icon name="Flame" size={24} color="var(--color-success-foreground)" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-heading font-bold text-foreground data-text">
                {currentStreak}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground caption mt-1">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
    </div>
  );
};

export default HeroWelcomeCard;