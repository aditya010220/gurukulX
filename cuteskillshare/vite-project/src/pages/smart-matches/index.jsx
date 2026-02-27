import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const matchesData = [
  {
    id: 1,
    name: 'David Kim',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c4856e22-1763294353311.png',
    title: 'Mobile App Developer',
    compatibilityScore: 95,
    canTeach: ['Flutter', 'React Native', 'iOS Development'],
    wantsToLearn: ['React', 'TypeScript', 'Web Development'],
    location: 'San Francisco, CA',
    rating: 4.9,
    reviews: 24,
  },
  {
    id: 2,
    name: 'Lisa Anderson',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_149978121-1763293908052.png',
    title: 'UX Researcher',
    compatibilityScore: 92,
    canTeach: ['User Research', 'Figma', 'Design Thinking'],
    wantsToLearn: ['JavaScript', 'React', 'Frontend Development'],
    location: 'New York, NY',
    rating: 4.8,
    reviews: 18,
  },
  {
    id: 3,
    name: 'James Martinez',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_13790d79a-1763295637209.png',
    title: 'DevOps Engineer',
    compatibilityScore: 88,
    canTeach: ['Docker', 'Kubernetes', 'AWS'],
    wantsToLearn: ['React', 'Node.js', 'Full Stack Development'],
    location: 'Austin, TX',
    rating: 4.7,
    reviews: 31,
  },
  {
    id: 4,
    name: 'Priya Patel',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_192d20565-1763300854621.png',
    title: 'Machine Learning Engineer',
    compatibilityScore: 85,
    canTeach: ['Python', 'TensorFlow', 'Machine Learning'],
    wantsToLearn: ['Web Development', 'React', 'JavaScript'],
    location: 'Seattle, WA',
    rating: 4.9,
    reviews: 42,
  },
  {
    id: 5,
    name: 'Sarah Chen',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png',
    title: 'Full Stack Developer',
    compatibilityScore: 82,
    canTeach: ['React', 'Node.js', 'GraphQL'],
    wantsToLearn: ['UI/UX Design', 'Figma', 'Motion Graphics'],
    location: 'Portland, OR',
    rating: 4.8,
    reviews: 29,
  },
  {
    id: 6,
    name: 'Michael Torres',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png',
    title: 'Product Designer',
    compatibilityScore: 79,
    canTeach: ['Figma', 'Sketch', 'Prototyping'],
    wantsToLearn: ['JavaScript', 'React', 'Animation'],
    location: 'Chicago, IL',
    rating: 4.6,
    reviews: 15,
  },
];

const SmartMatchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

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
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Smart Matches
        </h1>
        <p className="text-muted-foreground">
          AI-powered suggestions of peers with complementary skills
        </p>
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
                <Button variant="default" size="sm" iconName="MessageCircle" iconPosition="left">
                  Connect
                </Button>
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
