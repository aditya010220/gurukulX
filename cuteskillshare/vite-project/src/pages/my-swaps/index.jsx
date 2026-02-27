import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const swapsData = [
  {
    id: 1,
    partner: 'Sarah Chen',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png',
    teaching: 'React Development',
    learning: 'UI/UX Design',
    status: 'active',
    completedSessions: 6,
    totalSessions: 10,
    nextSession: 'Feb 13, 2026 at 3:00 PM',
    rating: 4.9,
  },
  {
    id: 2,
    partner: 'Michael Torres',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png',
    teaching: 'JavaScript Fundamentals',
    learning: 'Motion Graphics',
    status: 'active',
    completedSessions: 3,
    totalSessions: 8,
    nextSession: 'Feb 14, 2026 at 10:00 AM',
    rating: 4.7,
  },
  {
    id: 3,
    partner: 'Emma Wilson',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_117e4bd25-1763295402445.png',
    teaching: 'Web Development Basics',
    learning: 'Python for Data Analysis',
    status: 'active',
    completedSessions: 8,
    totalSessions: 10,
    nextSession: 'Feb 15, 2026 at 2:00 PM',
    rating: 4.8,
  },
  {
    id: 4,
    partner: 'David Kim',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c4856e22-1763294353311.png',
    teaching: 'TypeScript',
    learning: 'Flutter',
    status: 'completed',
    completedSessions: 10,
    totalSessions: 10,
    nextSession: null,
    rating: 5.0,
  },
  {
    id: 5,
    partner: 'Lisa Anderson',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_149978121-1763293908052.png',
    teaching: 'Node.js',
    learning: 'User Research',
    status: 'pending',
    completedSessions: 0,
    totalSessions: 6,
    nextSession: 'Awaiting confirmation',
    rating: null,
  },
];

const statusColors = {
  active: 'bg-success/20 text-success-foreground',
  completed: 'bg-primary/20 text-primary-foreground',
  pending: 'bg-warning/20 text-warning-foreground',
};

const statusIcons = {
  active: 'Zap',
  completed: 'CheckCircle2',
  pending: 'Clock',
};

const MySwapsPage = () => {
  const [tab, setTab] = useState('all');

  const filtered = swapsData.filter((s) => {
    if (tab === 'all') return true;
    return s.status === tab;
  });

  const stats = {
    active: swapsData.filter((s) => s.status === 'active').length,
    completed: swapsData.filter((s) => s.status === 'completed').length,
    pending: swapsData.filter((s) => s.status === 'pending').length,
  };

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          My Swaps
        </h1>
        <p className="text-muted-foreground">Track and manage all your skill exchanges</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', count: stats.active, icon: 'Zap', color: 'bg-success/20' },
          { label: 'Completed', count: stats.completed, icon: 'CheckCircle2', color: 'bg-primary/20' },
          { label: 'Pending', count: stats.pending, icon: 'Clock', color: 'bg-warning/20' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <Icon name={s.icon} size={20} color="var(--color-foreground)" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-3">
        {['all', 'active', 'completed', 'pending'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              tab === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Swaps List */}
      <div className="space-y-4">
        {filtered.map((swap) => (
          <div
            key={swap.id}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-warm-md transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <img
                src={swap.avatar}
                alt={swap.partner}
                className="w-14 h-14 rounded-2xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-semibold text-foreground">{swap.partner}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusColors[swap.status]}`}
                  >
                    <Icon
                      name={statusIcons[swap.status]}
                      size={10}
                      className="inline mr-1"
                      color="currentColor"
                    />
                    {swap.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="BookOpen" size={14} color="var(--color-success)" /> Teaching:{' '}
                    <span className="text-foreground font-medium">{swap.teaching}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="GraduationCap" size={14} color="var(--color-secondary)" /> Learning:{' '}
                    <span className="text-foreground font-medium">{swap.learning}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Progress */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">
                    {swap.completedSessions}/{swap.totalSessions} sessions
                  </p>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${(swap.completedSessions / swap.totalSessions) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                {swap.nextSession && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icon name="Calendar" size={12} color="var(--color-muted-foreground)" />
                    {swap.nextSession}
                  </p>
                )}
                {swap.rating && (
                  <p className="text-xs flex items-center gap-1">
                    <Icon name="Star" size={12} color="var(--color-warning-foreground)" />
                    <span className="font-semibold text-foreground">{swap.rating}</span>
                  </p>
                )}
              </div>
            </div>

            {swap.status === 'active' && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button variant="default" size="sm" iconName="Video" iconPosition="left">
                  Join Session
                </Button>
                <Button variant="outline" size="sm" iconName="MessageCircle" iconPosition="left">
                  Message
                </Button>
                <Button variant="ghost" size="sm" iconName="Calendar" iconPosition="left">
                  Reschedule
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icon name="ArrowLeftRight" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No swaps found</p>
          <p className="text-muted-foreground">
            Start a new exchange to begin swapping skills!
          </p>
        </div>
      )}
    </div>
  );
};

export default MySwapsPage;
