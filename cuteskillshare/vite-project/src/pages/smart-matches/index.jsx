import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const fallbackMatches = [
  {
    id: 1,
    name: 'Astha Singh',
    avatar: 'https://i.pinimg.com/736x/d6/b4/8b/d6b48b046fecd355c7228313d023121a.jpg',
    title: 'App Developer',
    compatibilityScore: 95,
    canTeach: ['Flutter', 'React Native', 'iOS Development'],
    wantsToLearn: ['React', 'TypeScript', 'Web Development'],
    location: 'Patna, Bihar',
    rating: 4.9,
    reviews: 24,
  }
];

const SmartMatchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // ─── Convex queries & mutations ─────────────────────────────
  const convexMatches = useQuery(api.smartMatches.getForUser, {
    filter: filter !== 'all' ? filter : undefined,
  });
  const sendRequest = useMutation(api.connections.sendRequest);
  const dismissMatch = useMutation(api.smartMatches.dismiss);
  const refreshMatches = useMutation(api.smartMatches.refresh);

  const matchesData = convexMatches && convexMatches.length > 0
    ? convexMatches.map((m) => ({
        id: m._id,
        matchId: m._id,
        matchedUserId: m.matchedUserId,
        name: m.matchedUserName,
        avatar: m.matchedUserAvatar || '',
        title: m.matchedUserTitle || '',
        compatibilityScore: m.compatibilityScore,
        canTeach: m.matchedUserSkills || [],
        wantsToLearn: m.matchedUserLearningGoals || [],
        location: '',
        rating: 4.8,
        reviews: 12,
      }))
    : fallbackMatches;

  const handleConnect = async (match) => {
    const targetUserId = match.matchedUserId || match.id;
    if (!targetUserId) return;

    try {
      await sendRequest({
        receiverId: targetUserId,
        message: "Hi! I would like to connect with you and exchange skills. Would you like to learn together?",
      });
      alert("Connection request sent!");
    } catch (err) {
      console.error('Connect failed:', err);
      alert(err.message || "Failed to send connection request");
    }
  };

  const handleDismiss = async (match) => {
    if (match.matchId) {
      try {
        await dismissMatch({ matchId: match.matchId });
      } catch (err) {
        console.error('Dismiss failed:', err);
      }
    }
  };

  const filtered = matchesData.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.canTeach.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            Smart Matches
          </h1>
          <p className="text-muted-foreground">
            AI-powered suggestions of peers with complementary skills
          </p>
        </div>
        <Button
          variant="outline"
          size="default"
          iconName="RefreshCw"
          iconPosition="left"
          onClick={async () => {
            try {
              await refreshMatches();
            } catch (err) {
              console.error(err);
            }
          }}
        >
          Refresh Matches
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search by name, skill, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', '90+', '80+'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {f === 'all' ? 'All' : `${f} Match`}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered
          .filter((m) => {
            if (filter === '90+') return m.compatibilityScore >= 90;
            if (filter === '80+') return m.compatibilityScore >= 80;
            return true;
          })
          .map((match) => (
            <div
              key={match.id}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-warm-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={match.avatar}
                  alt={match.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground truncate">
                    {match.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{match.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="MapPin" size={12} color="var(--color-muted-foreground)" />
                    <span className="text-xs text-muted-foreground">{match.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`text-lg font-bold ${
                      match.compatibilityScore >= 90
                        ? 'text-success-foreground'
                        : 'text-warning-foreground'
                    }`}
                  >
                    {match.compatibilityScore}%
                  </div>
                  <span className="text-[10px] text-muted-foreground">match</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Can Teach
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.canTeach.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-success/20 text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Wants to Learn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.wantsToLearn.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-secondary/40 text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} color="var(--color-warning-foreground)" />
                  <span className="text-sm font-semibold text-foreground">{match.rating}</span>
                  <span className="text-xs text-muted-foreground">({match.reviews})</span>
                </div>
                <div className="flex gap-2">
                  {match.matchId && (
                    <Button variant="ghost" size="sm" iconName="X" iconPosition="left" onClick={() => handleDismiss(match)}>
                      Dismiss
                    </Button>
                  )}
                  <Button variant="default" size="sm" iconName="MessageCircle" iconPosition="left" onClick={() => handleConnect(match)}>
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icon name="SearchX" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No matches found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default SmartMatchesPage;
