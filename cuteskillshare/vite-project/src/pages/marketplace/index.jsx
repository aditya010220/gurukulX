import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const offeringsData = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    coverImage: 'https://images.unsplash.com/photo-1542546068979-b6affb46ea8f',
    instructor: 'Sarah Chen',
    instructorAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png',
    description: 'Master advanced React patterns including compound components, render props, and custom hooks.',
    duration: '8 weeks',
    students: 124,
    level: 'Advanced',
    rating: 4.9,
    price: 450,
    category: 'Web Development',
  },
  {
    id: 2,
    title: 'UI/UX Design Fundamentals',
    coverImage: 'https://images.unsplash.com/photo-1675317120753-ce28b951e9e8',
    instructor: 'Michael Torres',
    instructorAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png',
    description: 'Learn the principles of user-centered design, from wireframing to prototyping.',
    duration: '6 weeks',
    students: 89,
    level: 'Beginner',
    rating: 4.8,
    price: 350,
    category: 'Design',
  },
  {
    id: 3,
    title: 'Python for Data Science',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1273044c1-1766319477622.png',
    instructor: 'Priya Patel',
    instructorAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_192d20565-1763300854621.png',
    description: 'Comprehensive introduction to Python for data analysis, covering pandas, NumPy, and visualization.',
    duration: '10 weeks',
    students: 156,
    level: 'Intermediate',
    rating: 4.9,
    price: 500,
    category: 'Data Science',
  },
  {
    id: 4,
    title: 'Mobile App Development',
    coverImage: 'https://images.unsplash.com/photo-1595846870485-df6f64d1e510',
    instructor: 'David Kim',
    instructorAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c4856e22-1763294353311.png',
    description: 'Build cross-platform mobile apps with React Native. Learn navigation, state management, and deployment.',
    duration: '12 weeks',
    students: 98,
    level: 'Intermediate',
    rating: 4.7,
    price: 550,
    category: 'Mobile Development',
  },
  {
    id: 5,
    title: 'DevOps & Cloud Computing',
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9',
    instructor: 'James Martinez',
    instructorAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_13790d79a-1763295637209.png',
    description: 'Master Docker, Kubernetes, CI/CD pipelines, and AWS cloud infrastructure from scratch.',
    duration: '10 weeks',
    students: 72,
    level: 'Intermediate',
    rating: 4.7,
    price: 480,
    category: 'DevOps',
  },
  {
    id: 6,
    title: 'Graphic Design Mastery',
    coverImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d',
    instructor: 'Lisa Anderson',
    instructorAvatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_149978121-1763293908052.png',
    description: 'From logo design to brand identity — everything you need to become a professional graphic designer.',
    duration: '8 weeks',
    students: 65,
    level: 'Beginner',
    rating: 4.8,
    price: 400,
    category: 'Design',
  },
];

const categories = ['All', 'Web Development', 'Design', 'Data Science', 'Mobile Development', 'DevOps'];

const levelColors = {
  Beginner: 'bg-success/20 text-success-foreground',
  Intermediate: 'bg-warning/20 text-warning-foreground',
  Advanced: 'bg-accent/30 text-accent-foreground',
};

const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  let filtered = offeringsData.filter((o) => {
    const matchesSearch = searchQuery
      ? o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCat = category === 'All' || o.category === category;
    return matchesSearch && matchesCat;
  });

  if (sortBy === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sortBy === 'popular') filtered = [...filtered].sort((a, b) => b.students - a.students);

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover premium skill offerings from expert instructors
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search courses or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Offerings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((offering) => (
          <div
            key={offering.id}
            className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-warm-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={offering.coverImage}
                alt={offering.title}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${levelColors[offering.level]}`}
              >
                {offering.level}
              </span>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-heading font-semibold text-foreground mb-1">{offering.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">
                {offering.description}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <img
                  src={offering.instructorAvatar}
                  alt={offering.instructor}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-foreground">{offering.instructor}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={12} color="var(--color-muted-foreground)" />
                  {offering.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Users" size={12} color="var(--color-muted-foreground)" />
                  {offering.students} students
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Star" size={12} color="var(--color-warning-foreground)" />
                  {offering.rating}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <Icon name="Coins" size={16} color="var(--color-secondary-foreground)" />
                  <span className="text-lg font-bold text-foreground">{offering.price}</span>
                  <span className="text-xs text-muted-foreground">coins</span>
                </div>
                <Button variant="default" size="sm" iconName="ShoppingCart" iconPosition="left">
                  Enroll
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icon name="Store" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No offerings found</p>
          <p className="text-muted-foreground">Try a different search or category</p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
