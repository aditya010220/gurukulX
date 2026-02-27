import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const groupsData = [
  {
    id: 1,
    name: 'React Developers',
    description: 'A community for React enthusiasts to share patterns, tips, and projects.',
    members: 128,
    category: 'Web Development',
    icon: 'Code2',
    color: 'bg-primary/20',
    isJoined: true,
    lastActive: '5 min ago',
    posts: 234,
  },
  {
    id: 2,
    name: 'UI/UX Design Circle',
    description: 'Explore design systems, user research, and creative workflows together.',
    members: 95,
    category: 'Design',
    icon: 'Palette',
    color: 'bg-accent/30',
    isJoined: true,
    lastActive: '1 hour ago',
    posts: 187,
  },
  {
    id: 3,
    name: 'Data Science Hub',
    description: 'Machine learning, data analysis, and Python programming discussions.',
    members: 76,
    category: 'Data Science',
    icon: 'BarChart3',
    color: 'bg-secondary/30',
    isJoined: false,
    lastActive: '30 min ago',
    posts: 156,
  },
  {
    id: 4,
    name: 'Mobile App Makers',
    description: 'Flutter, React Native, and native mobile development community.',
    members: 64,
    category: 'Mobile Development',
    icon: 'Smartphone',
    color: 'bg-success/20',
    isJoined: false,
    lastActive: '2 hours ago',
    posts: 98,
  },
  {
    id: 5,
    name: 'DevOps & Cloud',
    description: 'Docker, Kubernetes, AWS, and everything infrastructure.',
    members: 52,
    category: 'DevOps',
    icon: 'Cloud',
    color: 'bg-warning/20',
    isJoined: false,
    lastActive: '45 min ago',
    posts: 112,
  },
  {
    id: 6,
    name: 'Language Exchange',
    description: 'Practice spoken languages with peers from around the globe.',
    members: 203,
    category: 'Languages',
    icon: 'Globe',
    color: 'bg-primary/15',
    isJoined: true,
    lastActive: '10 min ago',
    posts: 345,
  },
];

const GroupsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [groups, setGroups] = useState(groupsData);

  const toggleJoin = (id) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isJoined: !g.isJoined } : g))
    );
  };

  const filtered = groups.filter((g) => {
    const matchesSearch = searchQuery
      ? g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesTab =
      tab === 'all' ? true : tab === 'joined' ? g.isJoined : !g.isJoined;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Groups
        </h1>
        <p className="text-muted-foreground">
          Join communities of learners and share knowledge together
        </p>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'joined', 'discover'].map((t) => (
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
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((group) => (
          <div
            key={group.id}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-warm-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl ${group.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon name={group.icon} size={22} color="var(--color-foreground)" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground truncate">
                  {group.name}
                </h3>
                <p className="text-xs text-muted-foreground">{group.category}</p>
              </div>
              {group.isJoined && (
                <span className="px-2 py-0.5 rounded-full bg-success/20 text-[10px] font-semibold text-success-foreground uppercase flex-shrink-0">
                  Joined
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
              {group.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Icon name="Users" size={12} color="var(--color-muted-foreground)" />
                {group.members} members
              </span>
              <span className="flex items-center gap-1">
                <Icon name="MessageSquare" size={12} color="var(--color-muted-foreground)" />
                {group.posts} posts
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={12} color="var(--color-muted-foreground)" />
                {group.lastActive}
              </span>
            </div>

            <Button
              variant={group.isJoined ? 'outline' : 'default'}
              size="sm"
              fullWidth
              iconName={group.isJoined ? 'LogOut' : 'UserPlus'}
              iconPosition="left"
              onClick={() => toggleJoin(group.id)}
            >
              {group.isJoined ? 'Leave Group' : 'Join Group'}
            </Button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icon name="Users" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No groups found</p>
          <p className="text-muted-foreground">Try a different search or explore more groups</p>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
